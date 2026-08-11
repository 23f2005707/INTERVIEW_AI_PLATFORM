import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAI } from '../services/openRouter.service.js';
import path from 'path';
import Interview from '../models/interview.models.js';
import User from '../models/user.models.js';


/// ANALYZE RESUME 

export const analyzeResume = async (req, res) => {
    try {
        // file not exists 
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" });
        }

        console.log("REQ.FILE:", req.file);


        // find file path 
        const filepath = req.file.path;

        console.log("FILE PATH:", filepath);
        console.log("FILE EXISTS:", fs.existsSync(filepath));

        // read the file and read the file data binary bytes 
        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(fileBuffer)

        // get the data from pdf pages 
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        // get all content of page and add on resumeText string 
        let resumeText = "";
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        // replace unknown character
        resumeText = resumeText.replace(/\s+/g, " ").trim();


        // message PROMPT 
        const messages = [
            {
                role: "system",
                content: `
                Extract structured data from resume.
                
                Return strictly JSON:
                
                {
                "role": "string",
                "experience": "string",
                "projects": ["project1", "project2"],
                "skills": ["skill1", "skill2"]}`
            },

            {
                role: "user",
                content: resumeText
            }
        ];


        // get the airesponse on messages 
        const aiResponse = await askAI(messages)

        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({
                message: "AI returned empty response."
            });
        }


        // change response into json
        let cleanedResponse = aiResponse.trim();

        cleanedResponse = cleanedResponse
                       .replace(/^```json\s*/i, "")
                        .replace(/^```\s*/i, "")
                        .replace(/\s*```$/i, "")
                        .trim();

        let parsed;

        try{
            parsed = JSON.parse(cleanedResponse);
        } catch(err) {
            console.error("AI returned invalid json:");
            console.error(aiResponse);

            return res.status(500).json({
                message: "AI returned invalid JSON."
            });
        }

        console.log("Parsed AI response:", parsed);

        fs.unlinkSync(filepath) // path deleted 

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        });
    }
    catch (err) {

        console.error("Resume Analysis Error:", err);

        // file exists -> delete file path
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: err.message });
    }
}


//// generate questions 
export const generateQuestion = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body

        // remove unnecessary spaces 
        role = role?.trim();
        experience = experience?.trim()
        mode = mode?.trim()

        if (!role || !experience || !mode) {
            return res.status(400).json({ message: "Role, Experience amd Mode are required." })
        }

        // check user 
        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({  // userId not exist in token
                message: "User not found",
            });
        }

        // minimum credits 
        if (user.credits < 50) {
            return res.status(400).json({
                message: "Not enough credits. Minimum 50 required."
            });
        }


        // projects
        const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

        // skills 
        const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None"

        //resume 
        const safeResume = resumeText?.trim() || "None";

        // User Prompt to give an AI  
        const userPrompt = `
        Role:${role}
        Experience:${experience}
        InterviewMode:${mode}
        Projects:${projectText}
        Skills:${skillsText}
        Resume:${safeResume}`;

        // check prompt exists or empty
        if (!userPrompt.trim()) {
            return res.status(400).json({
                message: "Prompt content is empty."
            });
        }


        // generate questions prompt messages

        const messages = [

            {
                role: "system",
                content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 10 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.
- Assign specific timing for each question.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → hard  
Question 4 → medium  
Question 5 → hard  
Question 6 → medium 
Question 7 → easy  
Question 8 → hard 
Question 9 → medium  
Question 10 → hard 

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
            }
            ,
            {
                role: "user",
                content: userPrompt
            }
        ];


        // get ai response from ai  
        const aiResponse = await askAI(messages)
        console.log("AI RESPONSE:", aiResponse);

        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({
                message: "AI returned empty response."
            });
        }

        const questionsArray = aiResponse
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 10);

        if (questionsArray.length === 0) {
            return res.status(500).json({
                message: "AI failed to generate questions."
            });
        }


        // reduce credits 
        user.credits -= 10;
        await user.save();


        /// create interview 
        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "hard", "medium", "hard", "medium", "easy", "hard", "medium", "hard"][index],
                timeLimit: [60, 60, 120, 90, 120, 90, 60, 120, 90, 120][index],
            }))
        })

        res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions
        });

    }
    catch (err) {
        console.error("GENERATE QUESTION ERROR:", err);

        return res.status(500).json({
            message: err.message,
            stack: err.stack
        });
    }
}



//// submit answer 
export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body

        const interview = await Interview.findById(interviewId)
        const question = interview.questions[questionIndex]

        // If no answer 
        if (!answer) {
            question.score = 0;
            question.feedback = "You didn't submit an answer",
                question.answer = "";

            await interview.save();

            return res.json({
                feedback: question.feedback
            });
        }

        // time exceeded 
        if (timeTaken > question.timeLimit) {
            question.score = 0;
            question.feedback = "Time limit exceeded.Answer not evaluated.";
            question.answer = answer;

            await interview.save();

            return res.json({
                feedback: question.feedback
            });
        }


        // messages that sends to AI 
        const messages = [
            {
                role: "system",
                content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
            }
            ,
            {
                role: "user",
                content: `
Question: ${question.question}
Answer: ${answer}
`
            }
        ];


        /// ai response 
        const aiResponse = await askAI(messages)

        const parsed = json.parse(aiResponse)

        question.answer = answer;
        question.confidence = parsed.confidence;
        question.communication = parsed.communication;
        question.correctness = parsed.correctness;
        question.score = parsed.finalScore;
        question.feedback = parsed.feedback


        await interview.save();

        return res.status(200).json({ feedback: parsed.feedback })


    } catch (err) {
        return res.status(500).json({ message: `failed to submit answer ${error}` })
    }
}

/// FINISH INTERVIEW
export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body
        const interview = await interview.findById(interviewId)

        if (!interview) {
            return res.status(400).json({ message: "failed to find Interview" })
        }

        // total questiins
        const totalQuestions = interview.questions.length;

        let totalScore = 0;
        let totalConfidence = 0;
        let totalCommunication = 0;
        let totalCorrectness = 0;

        interview.question.forEach((q) => {  // forEach 
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
        });

        const finalScore = totalQuestions ? totalScore / totalQuestions : 0;

        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;

        const avgCommunication = totalCommunication ? totalCommunication / totalQuestions : 0;

        // final score 
        interview.finalScore = finalScore;
        interview.status = "completed";

        await interview.save();


        // print score card of interview
        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCommunication.toFixed(1)),

            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
            })),
        })
    }
    catch (err) {
        return res.status(500).json({ message: `failed to finish interview` })
    }
}