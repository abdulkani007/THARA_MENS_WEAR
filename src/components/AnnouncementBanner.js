import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './AnnouncementBanner.css';

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    const docRef = doc(db, 'announcement', 'config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().enabled) {
      setAnnouncement(docSnap.data());
    }
  };

  if (!announcement) return null;

  return (
    <div className="announcement-banner">
      <div className="announcement-text">
        {announcement.message}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
