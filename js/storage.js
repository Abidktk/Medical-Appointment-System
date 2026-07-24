/* ==========================================================================
   MEDICARE SYSTEM - LOCAL STORAGE ENGINE & SEED DATA
   ========================================================================== */

const STORAGE_KEYS = {
    DOCTORS: 'medicare_doctors',
    APPOINTMENTS: 'medicare_appointments',
    USERS: 'medicare_users',
    DEPARTMENTS: 'medicare_departments',
    REVIEWS: 'medicare_reviews',
    MESSAGES: 'medicare_messages',
    NOTIFICATIONS: 'medicare_notifications',
    CURRENT_USER: 'medicare_current_user'
};

// Initial default departments dataset
const DEFAULT_DEPARTMENTS = [
    { id: "1", name: "Cardiology", icon: "fa-heart-pulse", description: "Heart health & cardiovascular care" },
    { id: "2", name: "Neurology", icon: "fa-brain", description: "Brain, spine & nervous system care" },
    { id: "3", name: "Pediatrics", icon: "fa-baby", description: "Child & adolescent healthcare" },
    { id: "4", name: "Orthopedics", icon: "fa-bone", description: "Bone, joint & musculoskeletal system" },
    { id: "5", name: "Dermatology", icon: "fa-allergies", description: "Skin, hair & nail care" },
    { id: "6", name: "Dentistry", icon: "fa-tooth", description: "Comprehensive dental & oral hygiene" },
    { id: "7", name: "General Medicine", icon: "fa-stethoscope", description: "Primary care & routine health checks" }
];

// Initial default doctor dataset
const DEFAULT_DOCTORS = [
    {
        id: "1",
        name: "Dr. Sarah Johnson",
        department: "Cardiology",
        degree: "MD, FACC",
        experience: 12,
        fee: 2000,
        rating: 4.9,
        reviewsCount: 24,
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
        availability: ["Monday", "Wednesday", "Friday"],
        timing: "09:00 AM - 02:00 PM",
        bio: "Dr. Sarah Johnson is a senior cardiologist with over 12 years of clinical experience in non-invasive cardiology and preventative heart care.",
        email: "sarah.johnson@medicare.com"
    },
    {
        id: "2",
        name: "Dr. Robert Chen",
        department: "Neurology",
        degree: "MBBS, MD (Neurology)",
        experience: 15,
        fee: 2500,
        rating: 4.8,
        reviewsCount: 18,
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
        availability: ["Tuesday", "Thursday", "Saturday"],
        timing: "10:00 AM - 04:00 PM",
        bio: "Specialist in treating brain and spine conditions, chronic headaches, stroke management, and nerve health disorders.",
        email: "robert.chen@medicare.com"
    },
    {
        id: "3",
        name: "Dr. Emily Smith",
        department: "Pediatrics",
        degree: "MD (Pediatrics)",
        experience: 8,
        fee: 1500,
        rating: 5.0,
        reviewsCount: 32,
        image: "https://images.unsplash.com/photo-1594824813566-88855ce75907?auto=format&fit=crop&q=80&w=600",
        availability: ["Monday", "Tuesday", "Thursday", "Friday"],
        timing: "09:00 AM - 01:00 PM",
        bio: "Passionate pediatrician committed to newborn care, adolescent growth tracking, vaccinations, and pediatric emergency care.",
        email: "emily.smith@medicare.com"
    },
    {
        id: "4",
        name: "Dr. James Wilson",
        department: "Orthopedics",
        degree: "MS (Orthopedics), FRCS",
        experience: 14,
        fee: 2200,
        rating: 4.7,
        reviewsCount: 15,
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
        availability: ["Wednesday", "Friday", "Saturday"],
        timing: "11:00 AM - 05:00 PM",
        bio: "Specializing in joint replacements, sports injuries, fracture management, and spine reconstruction.",
        email: "james.wilson@medicare.com"
    },
    {
        id: "5",
        name: "Dr. Aisha Khan",
        department: "Dermatology",
        degree: "MD (Dermatology)",
        experience: 7,
        fee: 1800,
        rating: 4.9,
        reviewsCount: 29,
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
        availability: ["Monday", "Wednesday", "Saturday"],
        timing: "02:00 PM - 07:00 PM",
        bio: "Expert cosmetologist and clinical dermatologist specializing in skin acne treatments, anti-aging therapies, and laser surgery.",
        email: "aisha.khan@medicare.com"
    },
    {
        id: "6",
        name: "Dr. Michael Taylor",
        department: "General Medicine",
        degree: "MBBS, FCPS",
        experience: 10,
        fee: 1200,
        rating: 4.6,
        reviewsCount: 20,
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timing: "08:00 AM - 02:00 PM",
        bio: "Primary care consultant specializing in general health diagnosis, diabetes management, hypertension, and routine wellness.",
        email: "michael.taylor@medicare.com"
    }
];

// Initial default users (Patient, Doctor, Admin)
const DEFAULT_USERS = [
    {
        id: "1",
        name: "Ali Ahmed",
        email: "ali@gmail.com",
        phone: "+92 300 1234567",
        cnic: "42101-1234567-1",
        password: "123456",
        role: "patient",
        createdAt: "2026-01-15"
    },
    {
        id: "2",
        name: "John Patient",
        email: "patient@medicare.com",
        phone: "+92 301 9876543",
        cnic: "42101-9876543-2",
        password: "patient123",
        role: "patient",
        createdAt: "2026-02-01"
    },
    {
        id: "3",
        name: "Dr. Sarah Johnson",
        email: "doctor@medicare.com",
        phone: "+92 312 3456789",
        cnic: "42101-3456789-3",
        password: "doctor123",
        role: "doctor",
        doctorId: "1",
        createdAt: "2026-01-01"
    },
    {
        id: "4",
        name: "System Administrator",
        email: "admin@medicare.com",
        phone: "+92 333 0000000",
        cnic: "42101-0000000-0",
        password: "admin123",
        role: "admin",
        createdAt: "2026-01-01"
    }
];

// Seed sample appointments
const DEFAULT_APPOINTMENTS = [
    {
        id: "APT-1001",
        patientId: "1",
        patientName: "Ali Ahmed",
        patientEmail: "ali@gmail.com",
        patientPhone: "+92 300 1234567",
        doctorId: "1",
        doctorName: "Dr. Sarah Johnson",
        department: "Cardiology",
        date: "2026-07-25",
        time: "11:30 AM",
        fee: 2000,
        status: "Pending",
        notes: "Regular heart checkup and blood pressure consultation.",
        createdAt: "2026-07-20"
    },
    {
        id: "APT-1002",
        patientId: "2",
        patientName: "John Patient",
        patientEmail: "patient@medicare.com",
        patientPhone: "+92 301 9876543",
        doctorId: "2",
        doctorName: "Dr. Robert Chen",
        department: "Neurology",
        date: "2026-07-24",
        time: "10:00 AM",
        fee: 2500,
        status: "Confirmed",
        notes: "Migraine follow up treatment.",
        createdAt: "2026-07-21"
    },
    {
        id: "APT-1000",
        patientId: "1",
        patientName: "Ali Ahmed",
        patientEmail: "ali@gmail.com",
        patientPhone: "+92 300 1234567",
        doctorId: "3",
        doctorName: "Dr. Emily Smith",
        department: "Pediatrics",
        date: "2026-07-10",
        time: "09:30 AM",
        fee: 1500,
        status: "Completed",
        notes: "Child immunization routine check.",
        createdAt: "2026-07-05"
    }
];

// Seed sample reviews
const DEFAULT_REVIEWS = [
    {
        id: "REV-1",
        doctorId: "1",
        patientId: "1",
        patientName: "Ali Ahmed",
        rating: 5,
        review: "Dr. Sarah was extremely polite and detailed during my consultation. Highly recommended!",
        date: "2026-07-11"
    },
    {
        id: "REV-2",
        doctorId: "3",
        patientId: "2",
        patientName: "John Patient",
        rating: 5,
        review: "Excellent pediatric care! Very gentle with my child.",
        date: "2026-07-12"
    }
];

// Seed sample notifications
const DEFAULT_NOTIFICATIONS = [
    {
        id: "NOTIF-1",
        userId: "1",
        title: "Appointment Received",
        message: "Your appointment (APT-1001) with Dr. Sarah Johnson is currently Pending confirmation.",
        date: "2026-07-20",
        read: false
    },
    {
        id: "NOTIF-2",
        userId: "2",
        title: "Appointment Confirmed",
        message: "Your appointment (APT-1002) with Dr. Robert Chen is Confirmed for 2026-07-24.",
        date: "2026-07-21",
        read: true
    }
];

class StorageManager {
    static init() {
        if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
            localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(DEFAULT_DOCTORS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
            localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
        }
    }

    // DOCTORS CRUD
    static getDoctors() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS)) || [];
    }

    static getDoctorById(id) {
        const doctors = this.getDoctors();
        return doctors.find(doc => String(doc.id) === String(id)) || null;
    }

    static saveDoctor(doctorData) {
        const doctors = this.getDoctors();
        if (doctorData.id) {
            const index = doctors.findIndex(doc => String(doc.id) === String(doctorData.id));
            if (index !== -1) {
                doctors[index] = { ...doctors[index], ...doctorData };
            } else {
                doctors.push(doctorData);
            }
        } else {
            doctorData.id = String(Date.now());
            doctors.push(doctorData);
        }
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
        return doctorData;
    }

    static deleteDoctor(id) {
        let doctors = this.getDoctors();
        doctors = doctors.filter(doc => String(doc.id) !== String(id));
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
    }

    // DEPARTMENTS CRUD
    static getDepartments() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) || [];
    }

    static saveDepartment(department) {
        const departments = this.getDepartments();
        if (!department.id) department.id = String(Date.now());
        departments.push(department);
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
        return department;
    }

    static deleteDepartment(id) {
        let departments = this.getDepartments();
        departments = departments.filter(dep => String(dep.id) !== String(id));
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    }

    // USERS CRUD
    static getUsers() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }

    static getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    }

    static saveUser(user) {
        const users = this.getUsers();
        if (user.id) {
            const index = users.findIndex(u => String(u.id) === String(user.id));
            if (index !== -1) {
                users[index] = { ...users[index], ...user };
            } else {
                users.push(user);
            }
        } else {
            user.id = String(Date.now());
            user.createdAt = new Date().toISOString().split('T')[0];
            users.push(user);
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return user;
    }

    // APPOINTMENTS CRUD
    static getAppointments() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
    }

    static getAppointmentById(id) {
        const appointments = this.getAppointments();
        return appointments.find(apt => String(apt.id) === String(id)) || null;
    }

    static saveAppointment(appointment) {
        const appointments = this.getAppointments();
        if (!appointment.id) {
            appointment.id = 'APT-' + Math.floor(1000 + Math.random() * 9000);
            appointment.createdAt = new Date().toISOString().split('T')[0];
        }
        
        const index = appointments.findIndex(a => String(a.id) === String(appointment.id));
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...appointment };
        } else {
            appointments.push(appointment);
        }

        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
        return appointment;
    }

    static updateAppointmentStatus(appointmentId, status) {
        const appointments = this.getAppointments();
        const apt = appointments.find(a => String(a.id) === String(appointmentId));
        if (apt) {
            apt.status = status;
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
            
            // Create notification for patient
            this.addNotification({
                userId: apt.patientId,
                title: `Appointment ${status}`,
                message: `Your appointment (${apt.id}) with ${apt.doctorName} is now ${status}.`
            });
            return apt;
        }
        return null;
    }

    // REVIEWS CRUD
    static getReviews() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS)) || [];
    }

    static saveReview(review) {
        const reviews = this.getReviews();
        review.id = 'REV-' + Date.now();
        review.date = new Date().toISOString().split('T')[0];
        reviews.push(review);
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

        // Update Doctor rating average
        this.recalculateDoctorRating(review.doctorId);
        return review;
    }

    static recalculateDoctorRating(doctorId) {
        const reviews = this.getReviews().filter(r => String(r.doctorId) === String(doctorId));
        if (reviews.length === 0) return;
        const totalRating = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const avgRating = parseFloat((totalRating / reviews.length).toFixed(1));

        const doctor = this.getDoctorById(doctorId);
        if (doctor) {
            doctor.rating = avgRating;
            doctor.reviewsCount = reviews.length;
            this.saveDoctor(doctor);
        }
    }

    // NOTIFICATIONS
    static getNotifications(userId = null) {
        this.init();
        const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
        if (userId) {
            return notifs.filter(n => String(n.userId) === String(userId));
        }
        return notifs;
    }

    static addNotification(notif) {
        const notifications = this.getNotifications();
        notif.id = 'NOTIF-' + Date.now();
        notif.date = notif.date || new Date().toISOString().split('T')[0];
        notif.read = false;
        notifications.unshift(notif);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        return notif;
    }

    // CONTACT MESSAGES
    static getMessages() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
    }

    static saveMessage(msg) {
        const messages = this.getMessages();
        msg.id = 'MSG-' + Date.now();
        msg.date = new Date().toISOString().split('T')[0];
        messages.unshift(msg);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        return msg;
    }

    // SESSION & CURRENT USER MANAGEMENT
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    }

    static setCurrentUser(user) {
        if (user) {
            // Strip password before storing in current user session
            const userSession = { ...user };
            delete userSession.password;
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userSession));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    }
}

// Initialize storage schema automatically on script load
StorageManager.init();
