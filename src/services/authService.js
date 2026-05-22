import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const registerNewAccount = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: userData.name || 'Користувач'
    });

    const rawData = {
      name: userData.name || 'Користувач',
      email: email,
      role: userData.role || 'user',
      telegramId: userData.telegramId || null,
      phoneNumber: userData.phoneNumber || null, // <--- ДОДАЛИ НОМЕР ТЕЛЕФОНУ
      height: userData.height ? Number(userData.height) : null,
      weight: userData.weight ? Number(userData.weight) : null,
      birthYear: userData.birthYear ? Number(userData.birthYear) : null,
      createdAt: new Date().toISOString()
    };

    const cleanData = JSON.parse(JSON.stringify(rawData));
    await setDoc(doc(db, 'users', user.uid), cleanData);

    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};