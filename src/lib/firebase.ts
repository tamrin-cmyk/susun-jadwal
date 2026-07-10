import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { SchoolConfig, Subject, Teacher, ClassItem, Assignment, TimeSlot, ScheduleSlot } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCHUkTR5-Y8xaVUVgP6PNEENtsxUwahfbM",
  authDomain: "snappy-container-7rr5c.firebaseapp.com",
  projectId: "snappy-container-7rr5c",
  storageBucket: "snappy-container-7rr5c.firebasestorage.app",
  messagingSenderId: "64347689771",
  appId: "1:64347689771:web:5de7773dd91fca4437ab6e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-penyusunjadwalsm-5410d187-4464-4a42-a9ef-0987a4d1c382");

export interface CloudScheduleData {
  config: SchoolConfig;
  subjects: Subject[];
  teachers: Teacher[];
  classes: ClassItem[];
  assignments: Assignment[];
  timeSlots: TimeSlot[];
  slots: ScheduleSlot[];
  updatedAt: string;
}

export async function saveScheduleToCloud(data: Omit<CloudScheduleData, 'updatedAt'>, documentId: string = 'default') {
  try {
    const docRef = doc(db, 'schedules', documentId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving schedule to Firebase:', error);
    throw error;
  }
}

export async function loadScheduleFromCloud(documentId: string = 'default'): Promise<CloudScheduleData | null> {
  try {
    const docRef = doc(db, 'schedules', documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CloudScheduleData;
    }
    return null;
  } catch (error) {
    console.error('Error loading schedule from Firebase:', error);
    throw error;
  }
}

export { db };
