// ১. Firebase কনফিগারেশন (আপনার নিজের কী-গুলো এখানে বসাবেন)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
}; 

// ২. Firebase ইনিশিয়ালাইজ করা
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
// পেজ লোড হওয়ার সাথে সাথেই লোকালস্টোরেজ চেক করা যেন পুরনো ডেটা মুছে না যায়
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('userProfile');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log("Found saved user:", userData.name);
        // এখানে চাইলে আপনার ড্যাশবোর্ড বা হোম পেজে রিডাইরেক্ট করার কোড দিতে পারেন
    }
});


// ৩. লগইন / সাইন আপ হ্যান্ডলিং (Local Cache দিয়ে সেভ রাখা)
document.getElementById('authForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const role = document.getElementById('userRole').value;

    const userData = { name, phone, role };
    localStorage.setItem('userProfile', JSON.stringify(userData));

    // ডাটাবেসে ইউজার সেভ করা
    database.ref('users/' + phone).set(userData);

    checkLoginState();
});

// ৪. লগইন স্টেট চেক করা
function checkLoginState() {
    const savedUser = localStorage.getItem('userProfile');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainPortal').style.display = 'flex';
        document.getElementById('logoutBtn').style.display = 'inline-block';

        // কেউ যদি 'চাকরিপ্রার্থী' হিসেবে লগইন করে, তবে তার জন্য চাকরির পোস্ট করার ফর্মটি হাইড বা বন্ধ থাকবে
        if (user.role === 'jobseeker') {
            document.getElementById('employerSection').style.display = 'none';
        } else {
            document.getElementById('employerSection').style.display = 'block';
        }
    } else {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('mainPortal').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

// ৫. লগ আউট সিস্টেম
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('userProfile');
    checkLoginState();
});

// ৬. পোস্ট ফর্ম সাবমিট করা
document.getElementById('jobForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const companyName = document.getElementById('companyName').value;
    const jobTitle = document.getElementById('jobTitle').value;
    const salary = document.getElementById('salary').value;
    const location = document.getElementById('location').value;
    const qualifications = document.getElementById('qualifications').value;
    const contact = document.getElementById('contact').value;

    database.ref('jobs').push({
        companyName: companyName,
        jobTitle: jobTitle,
        salary: salary,
        location: location,
        qualifications: qualifications,
        contact: contact,
        timestamp: Date.now()
    });

    document.getElementById('jobForm').reset();
});

// ৭. চাকরির তালিকা লোড করা
database.ref('jobs').on('child_added', function(snapshot) {
    const job = snapshot.val();
    const jobList = document.getElementById('jobList');
    const jobCard = document.createElement('div');
    jobCard.classList.add('job-card');

    jobCard.innerHTML = `
        <h3>${job.jobTitle}</h3>
        <p><strong>প্রতিষ্ঠান:</strong> ${job.companyName}</p>
        <p><strong>বেতন:</strong> ${job.salary}</p>
        <p><strong>লোকেশন:</strong> ${job.location}</p>
        <p><strong>যোগ্যতা:</strong> ${job.qualifications}</p>
        <a href="tel:${job.contact}" class="apply-btn">সরাসরি কল করুন (${job.contact})</a>
    `;

    jobList.prepend(jobCard);
});

// অ্যাপ ওপেন করার সাথে সাথে লগইন চেক করা
checkLoginState();
