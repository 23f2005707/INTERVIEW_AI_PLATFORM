import mongoose from 'mongoose'

// QUESTIONS SCHEMA
const questionSchema = new mongoose.Schema({
    question: String, 
    difficulty: String,
    timeLimit: Number,
    answer: String,
    feedback: String,
    score: {type : Number, default: 0},
    confidence: {type: Number, default: 0},
    communication: {type : Number, default: 0},
    correctness: {type: Number, default: 0},
})

// interview schema
const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type:String,
        required: true 
    },
    experience: {
        type: String, 
        required: true
    },
    mode: {
        type:String, 
        enum: ["HR", "Technical"],
        required: true
    },
    resumeText: {  // projects, skills
        type:String
    },
    questions:[questionSchema],

    finalScore: {
        type: Number, default: 0
    },

    status: {
        type: String, 
        enum: ["Incompleted", "completed"],
        default: "Incompleted",
    }

}, {timestamps: true}) 


// model
const Interview = mongoose.model("Interview", interviewSchema)

export default Interview