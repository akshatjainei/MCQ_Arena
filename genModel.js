require("dotenv").config()
const express = require('express')
const { GoogleGenerativeAI } = require("@google/generative-ai")
const fs = require("fs")

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
    const model = genAI.getGenerativeModel(
        { 
        model: "gemini-1.5-flash" , 
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction: "You are taking a quiz",
        }
    );
  
    const prompt = "Ask an hard to answer MCQ regarding F1 2024"

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  }
  
  run()

  module.exports = run