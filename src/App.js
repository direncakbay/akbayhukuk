import React, { useState, useEffect } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // <-- 1. ADIM: Analytics import edildi
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
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // <-- 2. ADIM: Measurement ID eklendi
};


// --- Bileşenler (Components) ---

// Logo Bileşeni
const Logo = () => (
    <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="w-40 sm:w-48 max-w-full flex-shrink-0">
        <img src="/logo.png" alt="Akbay Hukuk Logosu" className="w-full h-auto" />
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
                            <div className="bg-gray-100 p-8 rounded-lg text-center">
                                <img 
                                    src="/guldane.png" 
                                    alt="Av. Güldane Dörtbudak Akbay" 
                                    className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
                                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/128x128/cccccc/ffffff?text=G.D.A'; }}
                                />
                                <h4 className="text-2xl font-bold mb-4">Av. Güldane Dörtbudak Akbay</h4>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-left">{kurumsalData.guldane_bio}</p>
                            </div>
                            <div className="bg-gray-100 p-8 rounded-lg text-center">
                                <img 
                                    src="/direnc.png" 
                                    alt="Arb. Dr. Direnç Akbay" 
                                    className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
                                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/128x128/cccccc/ffffff?text=D.A'; }}
                                />
                                <h4 className="text-2xl font-bold mb-4">Arb. Dr. Direnç Akbay</h4>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-left">{kurumsalData.direnc_bio}</p>
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

const IletisimSection = ({ db, appId, isAuthReady }) => {
    const [iletisimData, setIletisimData] = useState(null);

    useEffect(() => {
        if (!db || !appId || !isAuthReady) return;
        const iletisimRef = doc(db, `artifacts/${appId}/public/data/iletisim`, "info");
        const unsubscribe = onSnapshot(iletisimRef, (doc) => {
            setIletisimData(doc.exists() ? doc.data() : null);
        });
        return () => unsubscribe();
    }, [db, appId, isAuthReady]);

    return (
        <section id="iletisim" className="py-20 bg-gray-900 text-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold" style={{fontFamily: "'Playfair Display', serif"}}>İletişim</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="bg-gray-800 p-8 rounded-lg">
                        <h3 className="text-2xl font-semibold mb-4">Akbay Hukuk</h3>
                        {iletisimData ? (
                            <div className="space-y-4 text-gray-300">
                                <p className="flex items-start">
                                    <svg className="w-6 h-6 mr-3 mt-1 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span>{iletisimData.address}</span>
                                </p>
                                <p className="flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11 11 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    <span>{iletisimData.phone}</span>
                                </p>
                                <p className="flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <a href={`mailto:${iletisimData.email}`} className="hover:underline">{iletisimData.email}</a>
                                </p>
                            </div>
                        ) : <p>İletişim bilgileri yükleniyor...</p>}
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
};

const Footer = () => (
    <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center text-gray-400">
            <p>© 2024 Akbay Hukuk Bürosu. Tüm hakları saklıdır.</p>
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
    const [iletisim, setIletisim] = useState(null);
    
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
        const unsubIletisim = onSnapshot(doc(db, `artifacts/${appId}/public/data/iletisim`, "info"), (doc) => {
            setIletisim(doc.exists() ? { id: doc.id, ...doc.data() } : null);
        });

        return () => {
            unsubKurumsal();
            unsubVizyon();
            unsubHizmetler();
            unsubYayinlar();
            unsubIletisim();
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
        if (window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/${collectionName}`, docId));
                setNotification({ type: 'success', message: 'Başarıyla silindi.' });
            } catch (error) {
                console.error("Silme hatası: ", error);
                setNotification({ type: 'error', message: 'Silme işlemi başarısız oldu.' });
            }
        }
    };
    
    const handleResetData = async () => {
        if (window.confirm("Bu işlem, eksik olan tüm başlangıç verilerini (Hizmetler, Vizyon vb.) yeniden oluşturacaktır. Mevcut verileriniz etkilenmez. Devam etmek istiyor musunuz?")) {
            try {
                await setupInitialData(db, appId);
                setNotification({ type: 'success', message: 'Başlangıç verileri başarıyla kontrol edildi ve eksikler eklendi.' });
            } catch (e) {
                setNotification({ type: 'error', message: 'Veri sıfırlama sırasında bir hata oluştu.' });
            }
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Paneli</h1>
                    <div>
                        <button onClick={handleResetData} className="bg-orange-500 text-white px-4 py-2 rounded-lg mr-4">Başlangıç Verilerini Sıfırla</button>
                        <button onClick={() => setPage('home')} className="text-blue-600 hover:underline mr-4">Siteyi Görüntüle</button>
                        <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Çıkış Yap</button>
                    </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4">İletişim Bilgilerini Düzenle</h2>
                    {iletisim && (
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate('iletisim', iletisim.id, { address: iletisim.address, phone: iletisim.phone, email: iletisim.email }); }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Adres</label>
                                <input value={iletisim.address} onChange={(e) => setIletisim({...iletisim, address: e.target.value})} className="w-full p-2 border rounded-lg"/>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Telefon</label>
                                <input value={iletisim.phone} onChange={(e) => setIletisim({...iletisim, phone: e.target.value})} className="w-full p-2 border rounded-lg"/>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">E-posta</label>
                                <input type="email" value={iletisim.email} onChange={(e) => setIletisim({...iletisim, email: e.target.value})} className="w-full p-2 border rounded-lg"/>
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Kaydet</button>
                        </form>
                    )}
                </div>

                {/* Hakkımızda */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Hakkımızda Bölümü</h2>
                    {kurumsal && (
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate('kurumsal', kurumsal.id, { guldane_bio: kurumsal.guldane_bio, direnc_bio: kurumsal.direnc_bio }); }}>
                            <textarea value={kurumsal.guldane_bio} onChange={(e) => setKurumsal({...kurumsal, guldane_bio: e.target.value})} className="w-full p-2 border rounded-lg h-24 mb-2"/>
                            <textarea value={kurumsal.direnc_bio} onChange={(e) => setKurumsal({...kurumsal, direnc_bio: e.target.value})} className="w-full p-2 border rounded-lg h-24 mb-4"/>
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Kaydet</button>
                        </form>
                    )}
                </div>

                {/* Vizyon */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Vizyon Bölümü</h2>
                    {vizyon.map(item => (
                        <div key={item.id} className="mb-4 p-4 border rounded-lg">
                            {editingVizyon?.id === item.id ? (
                                <form onSubmit={(e) => { e.preventDefault(); handleUpdate('vizyon', editingVizyon.id, { title: editingVizyon.title, content: editingVizyon.content }); }}>
                                    <input value={editingVizyon.title} onChange={e => setEditingVizyon({...editingVizyon, title: e.target.value})} className="w-full p-2 border rounded-lg mb-2"/>
                                    <textarea value={editingVizyon.content} onChange={e => setEditingVizyon({...editingVizyon, content: e.target.value})} className="w-full p-2 border rounded-lg h-20 mb-2"/>
                                    <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded-lg mr-2">Kaydet</button>
                                    <button onClick={() => setEditingVizyon(null)} className="bg-gray-500 text-white px-4 py-1 rounded-lg">İptal</button>
                                </form>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{item.title}</h4>
                                        <p>{item.content}</p>
                                    </div>
                                    <button onClick={() => setEditingVizyon(item)} className="bg-yellow-500 text-white px-4 py-1 rounded-lg">Düzenle</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Hizmetler */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Hizmetler Bölümü</h2>
                     {hizmetler.map(item => (
                        <div key={item.id} className="mb-4 p-4 border rounded-lg">
                            {editingHizmet?.id === item.id ? (
                                <form onSubmit={(e) => { e.preventDefault(); handleUpdate('hizmetler', editingHizmet.id, { title: editingHizmet.title, content: editingHizmet.content }); }}>
                                    <input value={editingHizmet.title} onChange={e => setEditingHizmet({...editingHizmet, title: e.target.value})} className="w-full p-2 border rounded-lg mb-2"/>
                                    <textarea value={editingHizmet.content} onChange={e => setEditingHizmet({...editingHizmet, content: e.target.value})} className="w-full p-2 border rounded-lg h-20 mb-2"/>
                                    <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded-lg mr-2">Kaydet</button>
                                    <button onClick={() => setEditingHizmet(null)} className="bg-gray-500 text-white px-4 py-1 rounded-lg">İptal</button>
                                </form>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold">{item.title}</h4>
                                        <p>{item.content}</p>
                                    </div>
                                    <button onClick={() => setEditingHizmet(item)} className="bg-yellow-500 text-white px-4 py-1 rounded-lg">Düzenle</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Yayınlar Yönetimi */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Yayınları Yönet</h2>
                    <form onSubmit={handleNewYayin} className="mb-6 p-4 bg-gray-50 rounded-lg">
                         <h3 className="text-xl font-semibold mb-2">Yeni Yayın Ekle</h3>
                         <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                             <select value={newYayin.type} onChange={e => setNewYayin({...newYayin, type: e.target.value})} className="p-2 border rounded-lg md:col-span-1">
                                 <option>Makale</option>
                                 <option>Kitap</option>
                                 <option>Kitap İçi Bölüm</option>
                                 <option>Bildiri</option>
                                 <option>Diğer</option>
                             </select>
                             <input 
                                 type="text" 
                                 placeholder="Yayın metnini girin..." 
                                 value={newYayin.text}
                                 onChange={e => setNewYayin({...newYayin, text: e.target.value})}
                                 className="w-full p-2 border rounded-lg md:col-span-2"
                            />
                         </div>
                         <button type="submit" className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg">Ekle</button>
                    </form>
                    
                    <h3 className="text-xl font-semibold mb-2">Mevcut Yayınlar</h3>
                    <div className="space-y-2">
                        {yayinlar.map(y => (
                            <div key={y.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                <div>
                                    <span className="font-bold text-sm mr-2 bg-blue-200 text-blue-800 px-2 py-1 rounded-full">{y.type}</span>
                                    <span>{y.text}</span>
                                </div>
                                <button onClick={() => handleDelete('yayinlar', y.id)} className="text-red-500 hover:text-red-700">Sil</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Ana Uygulama (App) ---

// Helper function for initial data setup
const setupInitialData = async (db, appId) => {
    if (!appId || appId === 'default-app-id') return;
    try {
        const collections = {
            vizyon: [
                { title: 'Yeni Nesil Hizmet', content: 'Mekândan bağımsız etkileşimli toplantılar ve belge paylaşımı sağlayan online altyapımızla ulaşılabilir ve düşük maliyetli hizmet sunuyoruz.' },
                { title: 'Güçlü İş Birlikleri', content: 'Alanında uzman akademisyenler ve sektör danışmanları ile müvekkillerimizin gereksinimlerine uygun, çözüm odaklı bir anlayışı benimsiyoruz.' },
                { title: 'Şeffaflık', content: 'Tüm hizmetlerimizi şeffaflık ve hesap verebilirlik ilkeleri üzerine inşa ediyor, süreç hakkında düzenli bilgilendirmeler yapıyoruz.' },
                { title: 'Etkili Yardım', content: 'Sadece uyuşmazlık anında değil, öncesinde de olası sorunları değerlendirerek hem uyuşmazlık öncesi hem de sonrası için yanınızdayız.' },
                { title: 'Kuram, Kural ve Kurum', content: 'Sorunlarınıza anlık çözümler yerine, hukuku kuramsal düzeyde değerlendirerek kalıcı ve sağlam çözümler öneriyoruz.' }
            ],
            hizmetler: [
                { title: "Dava ve İcra Takipleri", content: "Kamu hukuku veya özel hukuktan kaynaklanan her türlü hukuk sürecinin başlatılması, yürütülmesi ve takibi." },
                { title: "Hukukî Danışmanlık", content: "Gerçek ve tüzel kişilerin uyuşmazlık öncesi ve sonrası süreçlerinin değerlendirilmesi, sorularının cevaplandırılması, değişik olasılıklar dikkate alınarak hukukî tavsiyelerde bulunulması, raporlar ve sözleşmeler hazırlanması." },
                { title: "Meslek Profesyonelleri İçin Hukukî Süreç Yönetimi ve Dava Koçluğu", content: "Çözümü uzmanlık gerektiren konularda özellikle avukatlara yönelik sağlanan hizmetlerdir. Bu çerçevede, uzmanlardan oluşan çözüm ortaklarımızca değerlendirmeler yapılması, sanal veya fizikî toplantılar düzenlenmesi, hukukî süreç yönetimi, dava koçluğu, uzmanlardan dava veya uyuşmazlıklara ilişkin mütalaalar ve raporlar alınması, dava stratejilerinin belirlenmesi gibi ihtiyaç odaklı kapsamlı çözümler sunulmakta ve organizasyonlar yapılabilmektedir." },
                { title: "Arabuluculuk", content: "Tarafların üzerinde serbestçe tasarruf edebilecekleri iş veya işlemlerden doğan özel hukuk uyuşmazlıklarının çözümlenmesinde, alternatif bir çözüm yolu olarak arabuluculuk hizmeti sunulmaktadır. Özellikle ticari uyuşmazlıkların mahkeme önüne gitmeden çözümlenebilmesi için profesyonel müzakere teknikleri uygulanır." },
                { title: "Hukukî Eğitim Faaliyetleri", content: "Çözüm ortaklarımız ve uzmanlarımızın da katkısıyla danışanlarımız veya müvekkillerimize her türlü hukukî eğitim verilebilmektedir. Bu eğitimler, spesifik bilgi gerektiren alanlar için meslek profesyonellerine yönelik olabileceği gibi şirketlerin ilgili departman personellerine yönelik de olabilmektedir." }
            ],
            yayinlar: [
                { type: 'Kitap', text: "Akbay, Direnç: Türk Ticaret Kanunu Tasarısı'na Göre Limited Ortaklık Genel Kurulunun Toplanma ve Karar Alma Esasları, İstanbul, 2010." },
                { type: 'Makale', text: "Akbay, Direnç: Anonim Ortaklıklarda Özel Denetimin Konusu, D.E.Ü. Hukuk Fakültesi Dergisi, (21),2, 2019, s. 629-660." },
            ]
        };

        for (const [colName, data] of Object.entries(collections)) {
            const colRef = collection(db, `artifacts/${appId}/public/data/${colName}`);
            const snapshot = await getDocs(colRef);
            if (snapshot.empty) {
                console.log(`Populating empty collection: ${colName}`);
                for (const item of data) {
                    await addDoc(colRef, item);
                }
            }
        }

        const kurumsalRef = doc(db, `artifacts/${appId}/public/data/kurumsal`, "hakkimizda");
        const kurumsalSnap = await getDoc(kurumsalRef);
        if (!kurumsalSnap.exists()) {
            await setDoc(kurumsalRef, {
                guldane_bio: "1988 Ankara doğumludur. Dokuz Eylül Üniversitesi Hukuk Fakültesi'nden 2012 yılında mezun olmuştur. Lisans eğitimi süresince, İzmir ve Manisa'da çeşitli bürolarda çalışmıştır. Mezuniyet sonrası avukatlık stajını, 2013 yılında Manisa Barosu'nda tamamlamıştır. 2014 yılına kadar bağlı avukat olarak çalışmış, 2014 yılında Manisa'da Dörtbudak Hukuk Bürosu'nu kurmuştur. 2019 yılı sonunda İzmir'e taşınması sebebiyle, avukatlık faaliyetini İzmir Barosu'na bağlı olarak sürdürmeye başlamıştır.",
                direnc_bio: "2005 yılında, Dokuz Eylül Üniversitesi Hukuk Fakültesi'nden birincilikle mezun olmuştur. Ticaret Hukuku Anabilim Dalı'nda araştırma görevlisi olarak çalışmaya başlamıştır. 2017 yılında özel hukuk doktoru unvanını almıştır. Almanya Konstanz Üniversitesi ve Mannheim Üniversitesi'nde araştırmalarda bulunmuştur. Ekim 2021'den itibaren İzmir Ekonomi Üniversitesi Hukuk Fakültesi, Ticaret Hukuku Anabilim Dalı'nda Dr. Öğr. Üyesi olarak görev yapmaktadır. 2020'den beri Arabulucu olarak da faaliyet göstermektedir."
            });
        }
        
        const iletisimRef = doc(db, `artifacts/${appId}/public/data/iletisim`, "info");
        const iletisimSnap = await getDoc(iletisimRef);
        if (!iletisimSnap.exists()) {
            await setDoc(iletisimRef, {
                address: "Adalet Mh., Altınyol Cd., No: 41/101, Megapol Tower, K: 10, D: 1012 Bayraklı/İZMİR",
                phone: "0 (530) 772 47 74",
                email: "bilgi@akbayhukuk.com"
            });
        }

    } catch (error) {
        console.error("Initial data setup failed:", error);
    }
};


function App() {
    const [page, setPage] = useState('home'); // 'home' or 'admin'
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState({ type: '', message: '' });
    
    // Firebase state
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [appId, setAppId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const ADMIN_EMAIL = "bilgi@akbayhukuk.com"; // Admin email'i burada tanımlıyoruz

    // Tek seferlik Firebase kurulumu
    useEffect(() => {
        if (firebaseConfig.apiKey && firebaseConfig.measurementId) { // <-- 3. ADIM: Measurement ID'nin varlığı kontrol ediliyor
            const initializedApp = initializeApp(firebaseConfig);
            setAuth(getAuth(initializedApp));
            setDb(getFirestore(initializedApp));
            setAppId(firebaseConfig.projectId);
            getAnalytics(initializedApp); // <-- 4. ADIM: Analytics başlatılıyor
            console.log("Firebase & Analytics initialized.");
        } else {
            console.error("Firebase config is missing! Check your Netlify environment variables.");
            setIsAuthReady(true); // Prevent getting stuck
        }
    }, []);

    // Auth ve Data kurulumu için ayrı bir effect
    useEffect(() => {
        if (!auth || !db || !appId) return; // Wait for initialization

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is authenticated
                if (currentUser.email === ADMIN_EMAIL) {
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
                
                await setupInitialData(db, appId);
                
                setIsAuthReady(true);
            } else {
                // No user, attempt to sign in anonymously
                try {
                   await signInAnonymously(auth);
                } catch (error) {
                    console.error("Anonymous sign-in failed:", error);
                    setIsAuthReady(true); // Prevent getting stuck on error
                }
            }
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [auth, db, appId]);


    const handleDismissNotification = () => {
        setNotification({ type: '', message: '' });
    };

    if (!isAuthReady) {
        return <div className="flex justify-center items-center h-screen">Site Yükleniyor...</div>;
    }

    if (page === 'admin') {
        return (
            <>
                <Notification {...notification} onDismiss={handleDismissNotification} />
                {user ? (
                    <AdminDashboard auth={auth} db={db} setPage={setPage} setNotification={setNotification} appId={appId} />
                ) : (
                    <AdminLogin auth={auth} setNotification={setNotification} ADMIN_EMAIL={ADMIN_EMAIL} />
                )}
            </>
        );
    }

    return (
        <div className="bg-gray-50 text-gray-800">
            <style>
                {`
                .hero-section {
                    background: linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.8)), url('https://placehold.co/1920x1080/64748b/ffffff?text=Hukuk+Bürosu') no-repeat center center;
                    background-size: cover;
                }
                `}
            </style>
            <Header setPage={setPage} />
            <main>
                <Hero />
                <KurumsalSection db={db} appId={appId} isAuthReady={isAuthReady} />
                <HizmetlerSection db={db} appId={appId} isAuthReady={isAuthReady} />
                <YayinlarSection db={db} appId={appId} isAuthReady={isAuthReady} />
                <IletisimSection db={db} appId={appId} isAuthReady={isAuthReady} />
            </main>
            <Footer />
        </div>
    );
}

export default App;
