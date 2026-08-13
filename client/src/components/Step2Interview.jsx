import React from 'react'
// 1. 
import maleVideo from '../assets/videos/male-ai.mp4'
import femaleVideo from '../assets/videos/female-ai.mp4'
import Timer from './Timer'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import { start } from 'repl'
import { BsArrowLeft } from 'react-icons/bs'
import { current } from '@reduxjs/toolkit'
import { finishInterview } from '../../../server/controllers/interview.controller'


const Step2Interview = ({ interviewData, onFinish }) => {
  // 2.
  const { interviewId, questions, userName } = interviewData

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLeft || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];


  // 3. load the voices 
  useEffect(() => {
    const loadVoices = () => {
      // browser se saari text-to-speech voices nikalo
      const voices = window.speechSynthesis.getVoices()

      if (!voices.length) return;

      // Try known female voices first 
      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("Female");
        return;
      }

      // male voices 
      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // fallback: first voice (asume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    // built-in text-to-speech API
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [])


  // 4. 
  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;


  /* 5. ------------------SPEAK FUNCTION----------------------- */
  const speakText = (text) => {
    // wait until speaking finished
    return new Promise((resolve) => {
      if (!selectedVoice || !window.speechSynthesis) {
        console.log("No voice present")
        resolve();
        return;
      }

      // cancel older text to voice and add new one.
      window.speechSynthesis.cancel();

      // Add natural pausees after commas and periods 
      const humanText = text.replace(/, /g, ", ... ")
        .replace(/\./g, ". ... ");

      // create new object for voices
      const utterance = new window.SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // make it human-like voice speed 
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log("Speech STARTED");
        setIsAIPlaying(true);

        // 8. stop mic when ai speaks
        stopMic();

        videoRef.current?.play();
      };

      utterance.onend = () => {
        console.log("Speech ENDED");
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);


        // 8. mic on
        if(isMicOn) startMic();


        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);

      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);

    });
  };


  // 6. RUN INTRO
  useEffect(() => {
    if (!selectedVoice) {
      return;
    }

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText("I'll ask you a few quesrions. Just answer naturally, and take your time. Let's begin.");

        setIsIntroPhase(false);

      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));

        // if last question (hard level)
        if (currentIndex == questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question)

        // 8. mic on 
        if(isMicOn) startMic();
      }
    }

    runIntro();

  }, [selectedVoice, isIntroPhase])


  // 7. set timeLeft
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if(isSubmitting) return;  // 10.

    const timer = setInterval(() => {
      setTimeLeft((prev) => {  // prevtime
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      })
    }, 1000)

    return () => clearInterval(timer)

  }, [isIntroPhase, currentIndex, timeLeft, isSubmitting])


  // 8. handle speak recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-us";
    recognition.continuous = true;
    recognition.interimResults = false;

    // start recogn and handle transcript
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;

  }, []);


/////////////////////  9. ///////////////////
  // start mic
  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  // end mic
  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }

  const toggleMic = () => {
    if(isMicOn) {
      stopMic();
    }
    else {
      startMic();
    }

    setIsMicOn(!isMicOn);
  }


  // 10. submit the answer 
  const submitAnswer = async() => {
    if(isSubmitting) {
      return;
    }
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: 
          currentQuestion.timeLeft - timeLeft,
      }, {withCredentials: true})

      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)

    } catch(err) {
      console.log(err);
      setIsSubmitting(false)
    }
  } 


  // 11. handle next function 
  const handleNext = async() => {
    setAnswer("");
    setFeedback("");

    if(currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if(isMicOn) startMic();
    }, 500);
  }

  // 11. finish interview
  const finishInterview = async(params) => {
    stopMic()
    setIsMicOn(false)

    try{
      const result = await axios.post(ServerUrl + "/api/interview/finish", {
        interviewId}, {withCredentials: true})

        console.log(result.data)
        onFinish(result.data)
      }

      catch(err) {
        console.log(err)
      }
  }


  // 1.
  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

        {/* VIDEO SECTION */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
            {/* 4. add video properties */}
            <video src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className='w-full h-auto object-cover'
            />
          </div>


          {/* subtitle pending */}
          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>

              {/* Test button
              <button
                onClick={() => speakText("Hello! How can I help you today?")}
                className="px-5 py-2 bg-blue-500 text-white rounded-lg"
              >
                🔊 Test Voice
              </button> */}

            </div>

          )}


          {/* timer Area */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>

              {/* /* AI SPEAK */}
              {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'>
                {isAIPlaying ? "AI Speaking" : ""}
              </span>}
            </div>

            {/* DIVIDER LINE */}
            <div className='h-px bg-gray-200'></div>

            {/* TIMER SECTION */}
            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
            </div>

            {/* DIVIDER LINE */}
            <div className='h-px bg-gray-200'></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400'>Current Questions</span>
              </div>

              <div>
                <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                <span className='text-xs text-gray-400'>Total Questions</span>
              </div>
            </div>

          </div>

        </div>

        {/* TEXT SECTION */}
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>

          {!isIntroPhase && <div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>{currentQuestion?.question}</div>
          </div>}

          {/* INPUT TEXT AREA SECTION */}
          <textarea
            placeholder='Type your answer here...'
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className='flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800' />

            {/* 10 .  */}
          {!feedback ? (<div className='flex items-center gap-4 mt-6'>
            <motion.button
              onClick={toggleMic}
              whileTap={{scale: 0.9}}
             className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'>
              {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
            </motion.button>

            <motion.button
              onClick = {submitAnswer}
              disabled = {isSubmitting}
              whileTap={{scale: 0.95}}
              className= 'flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
                 {isSubmitting ? "Submitting..." : "Submit Answer"}
              Submit Answer
            </motion.button>

          </div>):(
            <motion.div 
              intial={{opacity: 0}}
              animate={{ opacity: 1 }}
              className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>
              <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>

              <button
                onClick = {handleNext}
               className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
                Next Question <BsArrowLeft size = {18} />
              </button>'
            </motion.div>
          )}
        </div> 

      </div>


    </div>
  )
}

export default Step2Interview
