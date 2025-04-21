import {BACKEND_URL} from '@env';

export const getQuestions = async () => {
  try {
    console.log(`${BACKEND_URL}/questions/questions`);
    const response = await fetch(`${BACKEND_URL}/questions/questions`, {
      method: 'GET',
    });

    console.log(response.body);

    if (response.ok) {
      const questions = await response.json();
      return questions;
    } else {
      throw new Error(`Failed to fetch questions: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};
