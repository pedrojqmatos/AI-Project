
const firebaseConfig = {
  apiKey: "AIzaSyAuRhmtdebLqLluIEX5kEqE5j_IGvNaWQY",
  authDomain: "emmai-4b26e.firebaseapp.com",
  projectId: "emmai-4b26e",
  storageBucket: "emmai-4b26e.appspot.com",
  messagingSenderId: "1020422953738",
  appId: "1:1020422953738:web:ed10e3868d3b64af7538f3",
  measurementId: "G-FF19TKF6QP"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

function updateProfilePicture() {
  const file = document.getElementById("profilePicture").files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    document.getElementById("profileImage").src = reader.result;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}

async function saveProfile() {
  const username = document.getElementById("username").value.trim();
  const file = document.getElementById("profilePicture").files[0];

  if (!username || !file) {
    alert("Please enter a username and select a profile picture.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    const dataUrl = reader.result;

    const user = auth.currentUser;
    if (!user) {
      alert("You need to be logged in to save your profile.");
      return;
    }

    const userId = user.uid;
    try {
      await user.updateProfile({
        displayName: username
      });

      await db.collection("users").doc(userId).set(
        {
          username: username,
          profilePictureBase64: dataUrl
        },
        { merge: true }
      );

      const userProfile = {
        name: username,
        photo: dataUrl  
      };
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      alert("Profile saved successfully.");
      window.location.href = "/chat.html"; 
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile. Check console for details.");
    }
  };

  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      db.collection("users")
        .doc(userId)
        .get()
        .then((docSnap) => {
          if (docSnap.exists) {
            const data = docSnap.data();
            if (data.profilePictureBase64) {
              document.getElementById("profileImage").src = data.profilePictureBase64;
            }
            if (data.username) {
              document.getElementById("username").value = data.username;
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  });

  document
    .getElementById("profilePicture")
    .addEventListener("change", updateProfilePicture);
});
