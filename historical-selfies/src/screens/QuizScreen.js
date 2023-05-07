import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import Typewriter from 'react-native-typewriter';

import { getRandomImage } from '../UploadRandomImage';
import UploadImageButton from '../components/UploadImageButton';

import playIcon from '../../assets/icons/play.png';
import people from '../../assets/people.json';

export default function QuizScreen({ navigation }) {

    const MORPH_ENDPOINT = 'https://pyaar.ai/morph';

    const [imageUrl, setImageUrl] = useState('');
    const [morphUri, setMorphUri] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [randomImage, setRandomImage] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if (morphUri && randomImage) {
            const optionsArray = generateOptions();
            setOptions(optionsArray);
        }
    }, [morphUri, randomImage]);

    const generateOptions = () => {
        let num = 3
        const related = randomImage.related;
        const shuffledRelated = related.sort(() => Math.random() - 0.5);
        const otherOptions = shuffledRelated.slice(0, num).map((value) => people.find((person) => person.value === value).name);
        const allOptions = [...otherOptions, randomImage.value];
        const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
        return shuffledOptions;
    };

    const handleButtonClick = (selectedOption) => {
        if (selectedOption === randomImage.value) {
            setIsCorrect(true);
        }
    };

    async function checkImageAvailability(uri) {
        return Image.prefetch(uri)
            .then(() => true)
            .catch(() => false);
    }

    async function getMorph() {
        const { randomImageUrl, randomImageData } = await getRandomImage();
        setRandomImage(randomImageData);

        try {
            setIsLoading(true);

            const data = new FormData();
            data.append("firstImageRef", imageUrl);
            data.append("secondImageRef", randomImageUrl);
            data.append("isAsync", "True");
            data.append("isSequence", "False");

            const response = await fetch(MORPH_ENDPOINT, {
                method: "POST",
                headers: {
                    Authorization: "ImageMorpherV1",
                },
                body: data,
            });

            if (response.ok) {
                const resJson = await response.json();
                const uri = resJson.morphUri;

                while (!(await checkImageAvailability(uri))) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                setMorphUri(uri);
                setIsLoading(false);
                return;
            } else {
                setIsLoading(false);
                throw new Error(response);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error);
        }
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Morphing...</Text>
            </View>
        )
    }

    if (morphUri) {
        return (
            <View style={styles.container}>
                <Image style={styles.image} source={{ uri: morphUri }} />
                <Text style={styles.text}>Who are you morphed with?</Text>
                <View style={styles.buttonsContainer}>
                    {options.map((option, index) => (
                        <Button
                            key={index}
                            mode="outlined"
                            textColor='#fff'
                            style={[styles.quizButton, isCorrect && option === randomImage.value ? styles.selectedButton : null]}
                            onPress={() => handleButtonClick(option)}
                            disabled={isCorrect}
                        >
                            {option}
                        </Button>
                    ))}
                </View>
            </View >
        )
    }

    if (imageUrl) {
        return (
            <View style={styles.container}>
                <Button
                    onPress={() => getMorph()}
                >
                    <Image source={playIcon} />
                </Button>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <UploadImageButton
                setImageUrl={setImageUrl}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamiy: 'sans-serif',
    },
    image: {
        width: 300,
        height: 400,
    },
    text: {
        color: '#fff',
        fontSize: 20,
        marginTop: 15,
    },
    button: {
        backgroundColor: '#000',
        padding: 15,
    },
    quizButton: {
        width: '45%',
        margin: 5,
        borderRadius: 5,
    },
    loadingText: {
        fontSize: 15,
        padding: 20,
        color: '#fff',
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 15,
    },
    selectedButton: {
        backgroundColor: '#999',
    },
    resultText: {
        color: '#fff',
        fontSize: 20,
    },
});