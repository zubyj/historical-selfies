import React, { useState } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Camera } from 'expo-camera';

export default function UserSelfieScreen({ navigation }) {
    const [image, setImage] = useState(null);

    const takePhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access the camera is required.');
            return;
        }

        let result = await Camera.takePictureAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.1,
        });

        if (!result.canceled) {
            const { uri } = result;
            setImage(uri);
            saveImage(uri);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.1,
        });

        if (!result.canceled) {
            const asset = result.assets && result.assets[0];
            if (asset) {
                const { uri } = asset;
                setImage(uri);
                saveImage(uri);
            }
        }
    };

    const saveImage = async (uri) => {
        const fileName = uri.split('/').pop();
        const newPath = FileSystem.documentDirectory + fileName;

        try {
            await FileSystem.moveAsync({
                from: uri,
                to: newPath,
            });
            navigation.navigate('MorphingScreen', { imagePath: newPath });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Take a picture of your face</Text>
            <Button title="Take a selfie" onPress={takePhoto} />
            <Button title="Select from library" onPress={pickImage} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
