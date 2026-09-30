import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { useApp } from '../context/AppContext';
import { Camera, User, Phone, Mail, MapPin, HeartHandshake } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const EditProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { driver, updateDriver, goBack, showToast, addActivity } = useApp();

  const [firstName, setFirstName] = useState(driver.firstName);
  const [lastName, setLastName] = useState(driver.lastName);
  const [phone, setPhone] = useState(driver.phone);
  const [email, setEmail] = useState(driver.email);
  const [address, setAddress] = useState(driver.address);
  const [emergencyContact, setEmergencyContact] = useState(driver.emergencyContact);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      updateDriver({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone,
        email,
        address,
        emergencyContact,
      });

      addActivity({
        title: 'Profile Updated',
        description: 'Driver information updated successfully',
        timestamp: 'Just now',
        category: 'Account',
        iconName: 'user',
        colorType: 'pink',
      });

      showToast('Profile updated successfully');
      goBack();
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <AppHeader title="Edit Profile" showBack />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* AVATAR WITH CAMERA EDIT ICON */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: driver.avatarUrl }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => showToast('Choose photo from gallery')}
                activeOpacity={0.8}
              >
                <Camera size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          {/* TWO COLUMN ROW FOR NAMES */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="First Name"
                placeholder="Carlos"
                value={firstName}
                onChangeText={setFirstName}
                leftIcon={<User size={18} color={COLORS.textSecondary} />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Last Name"
                placeholder="Mendoza"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <InputField
            label="Phone Number"
            placeholder="+507 6000-1234"
            value={phone}
            onChangeText={setPhone}
            leftIcon={<Phone size={18} color={COLORS.textSecondary} />}
            keyboardType="phone-pad"
          />

          <InputField
            label="Email Address"
            placeholder="carlos@example.com"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Mail size={18} color={COLORS.textSecondary} />}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Address"
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            leftIcon={<MapPin size={18} color={COLORS.textSecondary} />}
          />

          <InputField
            label="Emergency Contact"
            placeholder="Emergency contact name & phone"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            leftIcon={<HeartHandshake size={18} color={COLORS.textSecondary} />}
          />

          {/* ACTION BUTTONS */}
          <View style={styles.buttonRow}>
            <SecondaryButton
              title="Cancel"
              onPress={goBack}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              style={{ flex: 1.5 }}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  changePhotoText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 8,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
});
