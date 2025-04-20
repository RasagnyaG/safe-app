export const getQuestions = async () => {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/questions`, {
            method: 'GET',
        });

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