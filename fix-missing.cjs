const fs = require('fs');

const missingCode = `
    return () => unsub();
  }, []);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setShowConsentModal(false);
          } else {
            setProfile(null);
            setShowConsentModal(true);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign-in error", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error("Sign-out error", error);
    }
  };

  const handleConsentAgreement = async (consentData: { marketing: boolean }) => {
    if (!user) return;
    try {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Pickleball Player',
        email: user.email || '',
        photoURL: user.photoURL || '',
        skillLevel: 'Recreational (3.0)',
        homeCourtId: '',
        matchesPlayed: 0,
        createdAt: Date.now(),
        dpaConsent: {
          accepted: true,
          acceptedAt: Date.now(),
          marketing: consentData.marketing
        }
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      setShowConsentModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.ADD, 'users');
    }
  };

  const handleDeclineConsent = async () => {
    setShowConsentModal(false);
    await handleSignOut();
  };

  const handleSetHomeCourt = async (courtId: string) => {
    if (!profile) return;
    try {
      const updated = { ...profile, homeCourtId: courtId };
      await setDoc(doc(db, 'users', profile.uid), updated);
      setProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleExportDataLog = () => {
    if (!profile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", \`dumapickle_dpa_export_\${profile.uid}.json\`);
    dlAnchorElem.click();
  };

  const handleEraseDataProfile = async () => {
    if (!profile || !user) return;
    if (window.confirm("Are you absolutely sure you want to permanently erase your profile? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', profile.uid));
        setProfile(null);
        await handleSignOut();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'users');
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-full mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Loading Court Directory...</p>
        </div>
      </div>
    );
  }

  // Final return
  return (
`;

const content = fs.readFileSync('src/App.tsx', 'utf8');

// We need to find the injection point.
// It is exactly at:
/*
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/main');
    });
    return (
    <div className="bg-gray-50 dark:bg-slate-900 text-gray-800 ...
*/

const targetRegex = /\}, \(error\) => \{\s*handleFirestoreError\(error, OperationType\.GET, 'settings\/main'\);\s*\}\);\s*return \(\s*<div/m;

const replacement = `}, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/main');
    });\n` + missingCode + `    <div`;

const updated = content.replace(targetRegex, replacement);

fs.writeFileSync('src/App.tsx', updated);
