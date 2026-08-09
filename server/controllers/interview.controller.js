import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAI } from '../services/openRouter.service.js';
import path from 'path';

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

        // change response into json
        const parsed = JSON.parse(aiResponse);

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