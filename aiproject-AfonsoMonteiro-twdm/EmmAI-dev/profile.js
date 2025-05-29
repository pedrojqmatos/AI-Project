// profile.js

// Firebase config – certifica-te que storageBucket está correto
const firebaseConfig = {
  apiKey: "AIzaSyAuRhmtdebLqLluIEX5kEqE5j_IGvNaWQY",
  authDomain: "emmai-4b26e.firebaseapp.com",
  projectId: "emmai-4b26e",
  storageBucket: "emmai-4b26e.appspot.com",
  messagingSenderId: "1020422953738",
  appId: "1:1020422953738:web:ed10e3868d3b64af7538f3",
  measurementId: "G-FF19TKF6QP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
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

function saveProfile() {
  const username = document.getElementById("username").value.trim();
  const file = document.getElementById("profilePicture").files[0];

  if (!username || !file) {
    alert("Please enter a username and select a profile picture.");
    return;
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      const storageRef = storage.ref(`profile_pictures/${userId}/${file.name}`);
      const uploadTask = storageRef.put(file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed:", error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            // Debug: mostra o downloadURL no console para confirmar que está correto
            console.log("Download URL:", downloadURL);
            db.collection("users")
              .doc(userId)
              .set({
                username: username,
                profilePicture: downloadURL,
              })
              .then(() => {
                const userProfile = {
                  name: username,
                  photo: downloadURL,
                };
                localStorage.setItem("userProfile", JSON.stringify(userProfile));
                alert("Profile saved successfully.");
              })
              .catch((error) => {
                console.error("Error saving profile:", error);
              });
          });
        }
      );
    } else {
      alert("You need to be logged in to save your profile.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      db.collection("users")
        .doc(userId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data.profilePicture) {
              document.getElementById("profileImage").src = data.profilePicture;
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
});
