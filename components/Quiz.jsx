import React, { useState } from 'react';

const Quiz = ({ quiz, onSubmitAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption !== null) {
      setSubmitted(true);
      onSubmitAnswer(selectedOption);
    }
  };

  return (
    <div className="mt-6 bg-card/50 border border-border rounded-xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-xl font-bold text-foreground mb-1">Check Your Understanding</h3>
      <p className="text-muted-foreground mb-6">{quiz.question}</p>
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          {quiz.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedOption === index
                  ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                  : 'bg-secondary border-border hover:border-muted-foreground/50'
              }`}
            >
              <input
                type="radio"
                name="quiz-option"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                disabled={submitted}
                className="w-4 h-4 text-blue-600 bg-muted border-muted-foreground focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-4 text-foreground font-medium">{option}</span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={selectedOption === null || submitted}
          className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground shadow-sm"
        >
          {submitted ? 'Answer Submitted' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
};

export default Quiz;