import { useState } from "react";

const useForm = () => {
    const [file, setFile] = useState(null);
    const [talks, setTalks] = useState({
        morningTopic: [],
        afternoonTopic: [],
    });

    const readFile = (file) => {
        console.log(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            console.log(fileContent);
            const matches = fileContent.match(/(.+?) (\d+min)/g);
            console.log(matches);
            if (matches) {
                const topics = matches.map((match) => {
                    const parts = match.match(/(.+?) (\d+min)/);
                    console.log(parts);
                    return {
                        title: parts[1].trim(),
                        duration: parseInt(
                            parts[2].replace("min", "").trim(),
                            10
                        ),
                    };
                });
                console.log(topics);

                const newTopics = randomTopics(topics);
                console.log(newTopics);

                const sessions = distributeTopics(newTopics);
                console.log(sessions);
            } else {
                alert("No se encontraron coincidencias en el archivo.");
            }
        };

        reader.readAsText(file);
    };

    const randomTopics = (topics) => {
        for (let i = topics.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [topics[i], topics[j]] = [topics[j], topics[i]];
        }
        return topics;
    };

    const distributeTopics = (topics) => {
        const morningTopicsLimit = 180; // 9 AM to 12 PM  = 180 minutes
        const afternoonTopicsLimit = 240; // 1 PM to 5 PM = 240 minutes

        const findCombination = (remainingTime, remainingTopics) => {
            if (remainingTime === 0) return [];
            if (remainingTime < 0 || remainingTopics.length === 0) return null;

            for (let i = 0; i < remainingTopics.length; i++) {
                const newremainingTopics = remainingTopics.slice();
                const topic = newremainingTopics.splice(i, 1)[0];

                const result = findCombination(
                    remainingTime - topic.duration,
                    newremainingTopics
                );
                if (result !== null) {
                    return [topic, ...result];
                }
            }
            return null;
        };

        let morningTopic = findCombination(morningTopicsLimit, topics.slice());
        if (!morningTopic) {
            morningTopic = useAvailableTime(morningTopicsLimit, topics.slice());
        }
        const morningTopicTitles = morningTopic.map((topic) => topic.title);
        topics = topics.filter(
            (topic) => !morningTopicTitles.includes(topic.title)
        );

        let afternoonTopic = findCombination(
            afternoonTopicsLimit,
            topics.slice()
        );
        if (!afternoonTopic) {
            afternoonTopic = useAvailableTime(
                afternoonTopicsLimit,
                topics.slice()
            );
        }

        return {
            morningTopic,
            afternoonTopic,
        };
    };

    return { file, setFile, readFile };
};

export default useForm;
