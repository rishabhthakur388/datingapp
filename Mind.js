const fs = require('fs');
const path = require('path');

class Mind {
  constructor(modelPath) {
    this.model = require(modelPath);
    this.responses = this.model.map(item => item.response);
  }

  think(input) {
    const closestResponse = this.findClosestResponse(input);
    if (closestResponse !== null) {
      return closestResponse;
    } else {
      // Load 404 responses from 404.json
      const errorResponses = require('./utils/404.json');
      const randomIndex = Math.floor(Math.random() * errorResponses.length);
      return errorResponses[randomIndex]; // Return a random error response
    }
  }

  findClosestResponse(input) {
    let closestDistance = Infinity;
    let closestResponse = null;

    this.model.forEach(item => {
      const distance = this.calculateDistance(input, item.question);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestResponse = item.response;
      }
    });

    return closestResponse ? closestResponse : null; // Return the first response string ????????????
  }

  calculateDistance(input, question) {
    return Math.abs(input.length - question.join(' ').length);
  }
}

module.exports = Mind;
