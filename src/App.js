import React, { useState, useEffect } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut,
    signInAnonymously
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    addDoc, 
    deleteDoc,
    query,
    getDocs
} from "firebase/firestore";

// --- Firebase Yapılandırması (Netlify Ortam Değişkenleri ile) ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};


// --- Bileşenler (Components) ---

// Logo Bileşeni
const Logo = () => (
    <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="w-40 sm:w-48 flex-shrink-0">
        <svg className="w-full h-auto" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
            <style>
                {`
                    .logo-main-text { font-family: 'Times New Roman', Times, serif; font-size: 26px; fill: #374151; text-anchor: middle; }
                    .logo-sub-text { font-family: 'Inter', sans-serif; font-size: 8px; fill: #4b5563; letter-spacing: 1.5px; text-anchor: middle; }
                    .logo-icon-bg { fill: #4b5563; }
                    .logo-icon-frame { stroke: #374151; stroke-width: 1.5; fill: none;}
                    .logo-icon-text { font-family: 'Times New Roman', Times, serif; font-size: 12px; fill: #ffffff; text-anchor: middle; dominant-baseline: central; }
                `}
            </style>
            <g>
                <g transform="translate(75, 16)">
                    <path className="logo-icon-bg" d="M-13.856, -8 L0, -16 L13.856, -8 L13.856, 8 L0, 16 L-13.856, 8 Z" />
                    <path className="logo-icon-frame" d="M-15.856, -9 L0, -18 L15.856, -9 L15.856, 9 L0, 18 L-15.856, 9 Z" />
                    <text className="logo-icon-text" x="0" y="1">G&amp;D</text>
                </g>
                <text className="logo-main-text" x="75" y="50">Akbay Hukuk</text>
                <text className="logo-sub-text" x="75" y="62">AVUKATLIK | DANIŞMANLIK</text>
            </g>
        </svg>
    </a>
);

// Bildirim Bileşeni
const Notification = ({ message, type, onDismiss }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onDismiss]);

    if (!message) {
        return null;
    }

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50";
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {message}
        </div>
    );
};


// --- Ana Sayfa Bileşenleri ---

const Header = ({ setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between py-2">
                    <Logo />
                    <nav className="hidden md:flex space-x-6 items-center">
                        <div className="relative group">
                            <button className="text-gray-600 hover:text-blue-600 transition duration-300 py-2 px-2 rounded-md inline-flex items-center">
                                <span>Kurumsal</span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-1 w-48 z-50">
                                <a href="#vizyon" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Vizyonumuz</a>
                                <a href="#hakkimizda" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Hakkımızda</a>
                            </div>
                        </div>
                        <a href="#hizmetler" className="text-gray-600 hover:text-blue-600 transition duration-300 py-2 px-2">Hizmetler</a>
                        <a href="#yayinlar" className="text-gray-600 hover:text-blue-600 transition duration-300 py-2 px-2">Yayınlar</a>
                        <a href="#iletisim" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">İletişim</a>
                         <button onClick={() => setPage('admin')} className="text-sm text-gray-500 hover:text-blue-600">Admin</button>
                    </nav>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} id="mobile-menu-button" className="md:hidden text-gray-900">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div id="mobile-menu" className="md:hidden">
                    <a href="#vizyon" className="block px-6 py-3 text-gray-600 hover:bg-gray-100">Vizyonumuz</a>
                    <a href="#hakkimizda" className="block px-6 py-3 text-gray-600 hover:bg-gray-100">Hakkımızda</a>
                    <a href="#hizmetler" className="block px-6 py-3 text-gray-600 hover:bg-gray-100">Hizmetler</a>
                    <a href="#yayinlar" className="block px-6 py-3 text-gray-600 hover:bg-gray-100">Yayınlar</a>
                    <a href="#iletisim" className="block px-6 py-3 text-gray-600 hover:bg-gray-100">İletişim</a>
                    <button onClick={() => setPage('admin')} className="block w-full text-left px-6 py-3 text-gray-600 hover:bg-gray-100">Admin</button>
                </div>
            )}
        </header>
    );
};

const Hero = () => {
    return (
        <section className="hero-section text-white py-24 md:py-32">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{fontFamily: "'Playfair Display', serif"}}>Yeni Nesil Avukatlık ve Danışmanlık</h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">Çözüm odaklı yaklaşımımız ve güçlü iş birliklerimizle, uyuşmazlık öncesi ve sonrası tüm hukuki süreçlerinizde yanınızdayız.</p>
                <a href="#iletisim" className="mt-8 inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition duration-300">Bize Ulaşın</a>
            </div>
        </section>
    );
};

const KurumsalSection = ({ db, appId, isAuthReady }) => {
    const [kurumsalData, setKurumsalData] = useState(null);
    const [vizyonData, setVizyonData] = useState([]);

    useEffect(() => {
        if (!db || !appId || !isAuthReady) return;

        const hakkimizdaRef = doc(db, `artifacts/${appId}/public/data/kurumsal`, "hakkimizda");
        const vizyonRef = collection(db, `artifacts/${appId}/public/data/vizyon`);

        const unsubHakkimizda = onSnapshot(hakkimizdaRef, (doc) => {
            setKurumsalData(doc.exists() ? doc.data() : { guldane_bio: "İçerik Yükleniyor...", direnc_bio: "İçerik Yükleniyor..." });
        });

        const unsubVizyon = onSnapshot(vizyonRef, (snapshot) => {
            const vizyonList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVizyonData(vizyonList);
        });

        return () => {
            unsubHakkimizda();
            unsubVizyon();
        };
    }, [db, appId, isAuthReady]);

    return (
        <>
            <section id="vizyon" className="pt-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>Vizyonumuz</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vizyonData.length > 0 ? vizyonData.map(item => (
                            <div key={item.id} className="bg-gray-50 p-8 rounded-lg shadow-sm">
                                <h4 className="text-xl font-semibold mb-2 text-blue-700">{item.title}</h4>
                                <p className="text-gray-600">{item.content}</p>
                            </div>
                        )) : <p>Vizyonumuz yükleniyor...</p>}
                    </div>
                </div>
            </section>
            <section id="hakkimizda" className="py-20 bg-white">
                {kurumsalData && (
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>Hakkımızda</h2>
                        </div>
                        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="bg-gray-100 p-8 rounded-lg shadow-md">
                                <h4 className="text-2xl font-bold mb-4">Av. Güldane Dörtbudak Akbay</h4>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{kurumsalData.guldane_bio}</p>
                            </div>
                            <div className="bg-gray-100 p-8 rounded-lg shadow-md">
                                <h4 className="text-2xl font-bold mb-4">Arb. Dr. Direnç Akbay</h4>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{kurumsalData.direnc_bio}</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

const HizmetlerSection = ({ db, appId, isAuthReady }) => {
    const [services, setServices] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        if (!db || !appId || !isAuthReady) return;
        const servicesRef = collection(db, `artifacts/${appId}/public/data/hizmetler`);
        const unsubscribe = onSnapshot(servicesRef, (snapshot) => {
            const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setServices(servicesList);
        });
        return () => unsubscribe();
    }, [db, appId, isAuthReady]);

    return (
        <section id="hizmetler" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>Hizmetlerimiz</h2>
                </div>
                <div className="space-y-4">
                    {services.length > 0 ? services.map((service, index) => (
                        <div key={service.id} className="bg-white rounded-lg shadow-sm">
                            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-100">
                                <span>{service.title}</span>
                                <svg className={`w-5 h-5 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {openIndex === index && (
                                <div className="px-5 pb-5 text-gray-600"><p>{service.content}</p></div>
                            )}
                        </div>
                    )) : <p>Hizmetlerimiz yükleniyor...</p>}
                </div>
            </div>
        </section>
    );
};

const YayinlarSection = ({ db, appId, isAuthReady }) => {
    const [yayinlar, setYayinlar] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !appId || !isAuthReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/yayinlar`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const yayinlarData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setYayinlar(yayinlarData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, appId, isAuthReady]);

    const groupYayinlar = (yayinlar) => {
        return yayinlar.reduce((acc, yayin) => {
            (acc[yayin.type] = acc[yayin.type] || []).push(yayin);
            return acc;
        }, {});
    };

    const groupedYayinlar = groupYayinlar(yayinlar);
    const categoryOrder = ['Kitap', 'Kitap İçi Bölüm', 'Makale', 'Bildiri', 'Diğer'];

    if (loading) {
        return <div className="text-center py-20">Yayınlar yükleniyor...</div>;
    }

    return (
        <section id="yayinlar" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>Akademik Yayınlar</h2>
                </div>
                <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                    {categoryOrder.map(category => (
                        groupedYayinlar[category] && (
                            <div key={category}>
                                <h3 className="text-2xl font-bold mb-6 mt-4">{category}</h3>
                                <ul className="space-y-4 list-disc list-inside text-gray-700">
                                    {groupedYayinlar[category].map(y => <li key={y.id}>{y.text}</li>)}
                                </ul>
                                <hr className="my-8"/>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </section>
    );
};

const IletisimSection = () => (
    <section id="iletisim" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold" style={{fontFamily: "'Playfair Display', serif"}}>İletişim</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <h3 className="text-2xl font-semibold mb-4">Akbay Hukuk</h3>
                    <p className="flex items-start mb-4">
                        <svg className="w-6 h-6 mr-3 mt-1 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>Adalet Mh., Altınyol Cd., No: 41/101, Megapol Tower, K: 10, D: 1012 Bayraklı/İZMİR</span>
                    </p>
                    <p className="flex items-center">
                        <svg className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11 11 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>0 (530) 772 47 74</span>
                    </p>
                </div>
                <div className="rounded-lg overflow-hidden h-full">
                    <iframe 
                        title="Akbay Hukuk Bürosu Konumu"
                        src="https://maps.google.com/maps?q=Megapol%20Tower%2C%20Adalet%20Mahallesi%2C%20Bayrakl%C4%B1%2C%20%C4%B0zmir&t=&z=17&ie=UTF8&iwloc=&output=embed"
                        width="100%" 
                        height="100%" 
                        style={{border:0, minHeight: '300px'}} 
                        allowFullScreen="" 
                        loading="lazy" 
                    />
                </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center text-gray-400">
            <p>&copy; 2024 Akbay Hukuk Bürosu. Tüm hakları saklıdır.</p>
        </div>
    </footer>
);


// --- Admin Panel Bileşenleri ---

const AdminLogin = ({ auth, setNotification, ADMIN_EMAIL }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (email !== ADMIN_EMAIL) {
            setNotification({ type: 'error', message: 'Bu e-posta adresi admin yetkisine sahip değil.' });
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setNotification({ type: 'success', message: 'Giriş başarılı!' });
        } catch (error) {
            console.error("Giriş hatası:", error);
            setNotification({ type: 'error', message: 'E-posta veya şifre hatalı.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo />
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">Admin Paneli Girişi</h2>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">E-posta</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder={ADMIN_EMAIL}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Giriş Yap</button>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard = ({ auth, db, setPage, setNotification, appId }) => {
    const [kurumsal, setKurumsal] = useState(null);
    const [vizyon, setVizyon] = useState([]);
    const [hizmetler, setHizmetler] = useState([]);
    const [yayinlar, setYayinlar] = useState([]);
    
    const [editingVizyon, setEditingVizyon] = useState(null);
    const [editingHizmet, setEditingHizmet] = useState(null);
    const [newYayin, setNewYayin] = useState({ type: 'Makale', text: '' });
    
    useEffect(() => {
        if (!db || !appId) return;

        const unsubKurumsal = onSnapshot(doc(db, `artifacts/${appId}/public/data/kurumsal`, "hakkimizda"), (doc) => {
            setKurumsal(doc.exists() ? { id: doc.id, ...doc.data() } : null);
        });
        const unsubVizyon = onSnapshot(collection(db, `artifacts/${appId}/public/data/vizyon`), (snapshot) => {
            setVizyon(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubHizmetler = onSnapshot(collection(db, `artifacts/${appId}/public/data/hizmetler`), (snapshot) => {
            setHizmetler(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubYayinlar = onSnapshot(collection(db, `artifacts/${appId}/public/data/yayinlar`), (snapshot) => {
            setYayinlar(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubKurumsal();
            unsubVizyon();
            unsubHizmetler();
            unsubYayinlar();
        };
    }, [db, appId]);

    const handleUpdate = async (collectionName, docId, data) => {
        try {
            const docRef = doc(db, `artifacts/${appId}/public/data/${collectionName}`, docId);
            await updateDoc(docRef, data);
            setNotification({ type: 'success', message: 'Başarıyla güncellendi.' });
            setEditingHizmet(null);
            setEditingVizyon(null);
        } catch (error) {
            console.error("Güncelleme hatası: ", error);
            setNotification({ type: 'error', message: 'Güncelleme başarısız oldu.' });
        }
    };

    const handleNewYayin = async (e) => {
        e.preventDefault();
        if (newYayin.text.trim() === '') return;
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/yayinlar`), newYayin);
            setNewYayin({ type: 'Makale', text: '' });
            setNotification({ type: 'success', message: 'Yeni yayın eklendi.' });
        } catch (error) {
            console.error("Yayın ekleme hatası: ", error);
            setNotification({ type: 'error', message: 'Yayın eklenemedi.' });
        }
    };

    const handleDelete = async (collectionName, docId) => {
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/${collectionName}`, docId));
            setNotification({ type: 'success', message: 'Başarıyla silindi.' });
        } catch (error) {
            console.error("Silme hata
