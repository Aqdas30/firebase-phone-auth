import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const PhoneAuthScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const signInWithPhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to send SMS to:', phoneNumber);
      
      // Updated API - direct method call
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      console.log('SMS sent successfully, confirmation:', confirmation.verificationId);
      setConfirmation(confirmation);
      Alert.alert('Success', 'Verification code sent to your phone');
    } catch (error: any) {
      console.error('Phone auth error details:', {
        code: error.code,
        message: error.message,
        nativeErrorMessage: error.nativeErrorMessage,
      });
      
      let errorMessage = 'Failed to send verification code';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Please enter a valid phone number with country code (e.g., +1234567890)';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/unknown') {
        errorMessage = 'Configuration error. Please check Firebase setup.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      console.log('Confirming code:', code);
      await confirmation?.confirm(code);
      console.log('Phone authentication successful');
      // User will be automatically signed in via onAuthStateChanged
    } catch (error: any) {
      console.error('Code confirmation error:', error);
      
      let errorMessage = 'Invalid verification code';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'The verification code is invalid. Please try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'The verification code has expired. Please request a new one.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = () => {
    setConfirmation(null);
    setCode('');
    signInWithPhoneNumber();
  };

  if (!confirmation) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Phone Authentication</Text>
        <Text style={styles.subtitle}>Enter your phone number to get started</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number (e.g., +1234567890)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={signInWithPhoneNumber}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Verification Code</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.debugText}>
          Debug: Make sure to use country code (e.g., +1 for US)
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Phone Number</Text>
      <Text style={styles.subtitle}>
        Enter the verification code sent to {phoneNumber}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={6}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={confirmCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton} 
        onPress={resendCode}
        disabled={loading}
      >
        <Text style={styles.linkText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default PhoneAuthScreen;