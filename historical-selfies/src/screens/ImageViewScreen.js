import React, { useState } from 'react';
import { StyleSheet, View, Image, Button, Text, ActivityIndicator } from 'react-native';

export default function ImageViewScreen({ navigation }) {

    const MORPH_ENDPOINT = 'https://pyaar.ai/morph';

    const image = navigation.getParam('image', null); // base 64 or uri of image
    const [morphUri, setMorphUri] = useState(null);
    const [isMorphUriReady, setIsMorphUriReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function checkImageAvailability(uri) {
        return Image.prefetch(uri)
            .then(() => true)
            .catch(() => false);
    }

    async function getMorph() {
        if (!image) {
            return;
        }
        try {
            setIsLoading(true);

            const data = new FormData();
            data.append("firstImageRef", image);
            data.append("secondImageRef", image);
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
                console.log('uri : ' + uri);

                while (!(await checkImageAvailability(uri))) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                setMorphUri(uri);
                setIsMorphUriReady(true);
                setIsLoading(false);
                return;
            } else {
                console.log('response' + response);
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
                <Text>Morphing Image</Text>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {isMorphUriReady && (
                <Image source={{ uri: morphUri }} style={styles.image} resizeMode="contain" />
            )}
            <Button title="Morph" onPress={() => getMorph()} />
            <Button title="Home" onPress={() => navigation.navigate('Home')} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '70%',
    },
});
