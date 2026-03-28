import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, ChevronRight, ChevronLeft, Heart, Instagram, Mail, ChevronDown, Lock, LayoutDashboard, Package, MessageSquare, LogOut, CheckCircle, Trash2, Settings, Tag } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Custom Styles & Color Palette (unchanged) ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

  .font-elegant { font-family: 'Cormorant Garamond', serif; }
  .font-sleek { font-family: 'Jost', sans-serif; }
  
  .stripe-bg {
    background-image: repeating-linear-gradient(to right, transparent, transparent 40px, rgba(244, 223, 230, 0.4) 40px, rgba(244, 223, 230, 0.4) 80px);
  }

  .lace-border {
    border: 1px solid #E0A3BB;
    padding: 4px;
    background-clip: content-box;
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 12s linear infinite;
  }
`;

const colors = {
  petalGlaze: '#EA9CAF',
  dustyOrchid: '#D56989',
  sorbetStem: '#C2DC80',
  mossGreen: '#97A13B',
  powderedLilac: '#F3EEF1',
  lavenderBlush: '#F4DFE6',
  deepRosewood: '#4A373C',
  mutedMauve: '#8A7A7E',
  creamyWhite: '#FCFBFB'
};

// --- Fallback product data (in case Supabase fetch fails) ---
const initialProducts = {
  classic: [
    { id: 1, name: "The Ethereal Sage", price: "$55", description: "Lush green foliage with ivory ribbons.", imgColor: colors.sorbetStem, inventory: 3 },
    { id: 2, name: "Blush Orchid Cascade", price: "$55", description: "Delicate pink petals woven into satin.", imgColor: colors.lavenderBlush, inventory: 3 },
    { id: 3, name: "The Pearl & Petal", price: "$55", description: "Classic white blooms with subtle pearlescent ribbon.", imgColor: colors.powderedLilac, inventory: 3 },
  ],
  collegiate: [
    { id: 4, name: "The Rattler Orchid (FAMU)", price: "$60", description: "Soft terracotta and sage green watercolor blooms.", imgColor: '#F2A679', inventory: 5 },
    { id: 5, name: "The Seminole Bloom (FSU)", price: "$60", description: "Deep muted garnet and antique gold ribbons.", imgColor: '#A35C65', inventory: 5 },
  ],
  greek: [
    { id: 6, name: "Salmon & Apple Blossom (AKA)", price: "$65", description: "Exquisite pink and green floral integration.", imgColor: colors.petalGlaze, inventory: 1 },
    { id: 7, name: "Crimson Lace (DST)", price: "$65", description: "Rich crimson orchids set against ivory lace.", imgColor: '#9B3C4B', inventory: 1 },
  ]
};

// --- Email helper ---
const sendResendEmail = async (subject, htmlContent) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'satinandstem@protonmail.com',
        subject,
        html: htmlContent,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// ---------- All UI Components ----------

const Navbar = ({ showToast, currentView, setCurrentView, cart }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsOpen(false);
  };

  return (
    <nav className="bg-[#FCFBFB]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#F4DFE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <div className="flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2" style={{ color: colors.deepRosewood }}>
              {isOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
            </button>
            <div className="hidden md:flex space-x-10 font-sleek text-sm tracking-widest uppercase items-center">
              <button onClick={() => setCurrentView('home')} className="hover:text-[#D56989] transition-colors" style={{ color: currentView === 'home' ? colors.dustyOrchid : colors.deepRosewood }}>Home</button>
              
              <div className="relative group py-10">
                <button 
                  className="hover:text-[#D56989] transition-colors flex items-center gap-1" 
                  style={{ color: ['classic', 'collegiate', 'greek'].includes(currentView) ? colors.dustyOrchid : colors.deepRosewood }}
                >
                  Collections <ChevronDown size={14} />
                </button>
                <div 
                  className="absolute left-0 top-[80px] w-64 bg-white border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300" 
                  style={{ borderColor: colors.lavenderBlush }}
                >
                  <div className="py-2 flex flex-col font-sleek text-xs tracking-widest uppercase">
                    <button onClick={() => setCurrentView('classic')} className="text-left px-6 py-4 hover:bg-[#F4DFE6]/30 transition-colors" style={{ color: colors.deepRosewood }}>The Classic</button>
                    <button onClick={() => setCurrentView('collegiate')} className="text-left px-6 py-4 hover:bg-[#F4DFE6]/30 transition-colors" style={{ color: colors.deepRosewood }}>Collegiate Heritage</button>
                    <button onClick={() => setCurrentView('greek')} className="text-left px-6 py-4 hover:bg-[#F4DFE6]/30 transition-colors" style={{ color: colors.deepRosewood }}>Greek Excellence</button>
                  </div>
                </div>
              </div>

              <button onClick={() => setCurrentView('custom')} className="hover:text-[#D56989] transition-colors" style={{ color: currentView === 'custom' ? colors.dustyOrchid : colors.deepRosewood }}>Custom</button>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <span className="font-elegant text-4xl tracking-wide" style={{ color: colors.dustyOrchid }}>
              Satin & Stem
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setCurrentView('cart')}
              className="hover:text-[#D56989] transition-colors flex items-center"
              style={{ color: colors.deepRosewood }}
            >
              <ShoppingBag size={20} strokeWidth={1} />
              <span className="ml-1 text-xs font-sleek font-medium mt-1">{cart.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`md:hidden absolute w-full bg-[#FCFBFB] border-b transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 border-[#F4DFE6]' : 'max-h-0 border-transparent'}`}
      >
        <div className="px-6 pt-4 pb-6 space-y-4 flex flex-col font-sleek text-sm tracking-widest uppercase">
          <button onClick={() => handleNavClick('home')} className="text-left hover:text-[#D56989]" style={{ color: colors.deepRosewood }}>Home</button>
          <div className="pt-4 border-t" style={{ borderColor: colors.powderedLilac }}>
            <span className="block mb-4 text-xs" style={{ color: colors.mutedMauve }}>Collections</span>
            <div className="pl-4 flex flex-col space-y-4">
              <button onClick={() => handleNavClick('classic')} className="text-left hover:text-[#D56989]" style={{ color: colors.deepRosewood }}>The Classic</button>
              <button onClick={() => handleNavClick('collegiate')} className="text-left hover:text-[#D56989]" style={{ color: colors.deepRosewood }}>Collegiate Heritage</button>
              <button onClick={() => handleNavClick('greek')} className="text-left hover:text-[#D56989]" style={{ color: colors.deepRosewood }}>Greek Excellence</button>
            </div>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: colors.powderedLilac }}>
            <button onClick={() => handleNavClick('custom')} className="text-left hover:text-[#D56989]" style={{ color: colors.deepRosewood }}>Custom Inquiry</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ setCurrentView }) => {
  return (
    <div className="relative overflow-hidden bg-[#FCFBFB] border-b border-[#F4DFE6]">
      <div className="absolute inset-0 stripe-bg opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 sm:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
        
        <div className="flex-1 text-left z-10">
          <p className="font-sleek text-xs tracking-[0.2em] uppercase mb-6" style={{ color: colors.mossGreen }}>
            A Modern Keepsake
          </p>
          <h1 className="text-5xl md:text-7xl font-elegant leading-tight mb-8" style={{ color: colors.deepRosewood }}>
            Graduation leis,<br />
            <span className="italic font-light" style={{ color: colors.dustyOrchid }}>elevated.</span>
          </h1>
          <p className="font-sleek text-lg max-w-md mb-8 font-light leading-relaxed" style={{ color: colors.mutedMauve }}>
            Beautifully crafted satin ribbons and delicate faux florals, designed to elegantly honor your milestone and last a lifetime.
          </p>
          
          <div className="flex items-center space-x-4 mb-12 pl-4 border-l-2" style={{ borderColor: colors.dustyOrchid }}>
            <p className="font-sleek text-xs uppercase tracking-widest leading-relaxed" style={{ color: colors.deepRosewood }}>
              <span className="font-medium" style={{ color: colors.dustyOrchid }}>Order Timeline:</span><br/>
              Please place your order at least 30 days in advance<br/>to allow enough time for it to be beautifully crafted.
            </p>
          </div>

          <div className="flex gap-6">
            <button 
              onClick={() => {
                document.getElementById('collections-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-sleek text-sm tracking-widest uppercase py-3 border-b-2 transition-all hover:pb-4"
              style={{ color: colors.deepRosewood, borderColor: colors.dustyOrchid }}
            >
              View Collections
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-md aspect-[3/4] lace-border bg-white flex items-center justify-center p-2">
           <div className="w-full h-full bg-[#F3EEF1] relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${colors.mossGreen} 10px, ${colors.mossGreen} 11px)` }}></div>
              <span className="font-elegant text-2xl italic z-10" style={{ color: colors.dustyOrchid }}>S & S</span>
              <p className="font-sleek text-xs tracking-widest uppercase mt-4 z-10" style={{ color: colors.mutedMauve }}>Signature Design</p>
           </div>
           <div className="absolute -top-4 -right-4 w-16 h-16 border-t border-r" style={{ borderColor: colors.dustyOrchid }}></div>
           <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b border-l" style={{ borderColor: colors.dustyOrchid }}></div>
        </div>
      </div>
    </div>
  );
};

const CollectionsSection = ({ setCurrentView }) => {
  return (
    <section id="collections-grid" className="py-24 bg-[#FCFBFB] border-b border-[#F4DFE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-elegant mb-4" style={{ color: colors.deepRosewood }}>Curated Collections</h2>
          <div className="w-12 h-[1px] mx-auto" style={{ backgroundColor: colors.dustyOrchid }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group cursor-pointer" onClick={() => setCurrentView('classic')}>
            <div className="aspect-square bg-white border border-[#F4DFE6] p-4 flex flex-col justify-between mb-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundColor: colors.powderedLilac }}></div>
               <div className="relative z-10 flex justify-end">
                 <span className="font-elegant text-3xl italic opacity-50" style={{ color: colors.dustyOrchid }}>01</span>
               </div>
               <div className="relative z-10">
                 <h3 className="font-elegant text-2xl mb-2" style={{ color: colors.deepRosewood }}>The Classic</h3>
               </div>
            </div>
            <p className="font-sleek text-sm leading-relaxed mb-4" style={{ color: colors.mutedMauve }}>Soft romantic hues and elegant neutral ribbons.</p>
            <span className="font-sleek text-xs tracking-widest uppercase pb-1 border-b" style={{ color: colors.dustyOrchid, borderColor: colors.dustyOrchid }}>Explore</span>
          </div>

          <div className="group cursor-pointer" onClick={() => setCurrentView('collegiate')}>
            <div className="aspect-square bg-white border border-[#F4DFE6] p-4 flex flex-col justify-between mb-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundColor: colors.sorbetStem, opacity: 0.3 }}></div>
               <div className="relative z-10 flex justify-end">
                 <span className="font-elegant text-3xl italic opacity-50" style={{ color: colors.mossGreen }}>02</span>
               </div>
               <div className="relative z-10">
                 <h3 className="font-elegant text-2xl mb-2" style={{ color: colors.deepRosewood }}>Collegiate Heritage</h3>
               </div>
            </div>
            <p className="font-sleek text-sm leading-relaxed mb-4" style={{ color: colors.mutedMauve }}>Watercolor interpretations of university colors, featuring FAMU & FSU.</p>
            <span className="font-sleek text-xs tracking-widest uppercase pb-1 border-b" style={{ color: colors.mossGreen, borderColor: colors.mossGreen }}>Explore</span>
          </div>

          <div className="group cursor-pointer" onClick={() => setCurrentView('greek')}>
            <div className="aspect-square bg-white border border-[#F4DFE6] p-4 flex flex-col justify-between mb-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundColor: colors.petalGlaze, opacity: 0.2 }}></div>
               <div className="relative z-10 flex justify-end">
                 <span className="font-elegant text-3xl italic opacity-50" style={{ color: colors.dustyOrchid }}>03</span>
               </div>
               <div className="relative z-10">
                 <h3 className="font-elegant text-2xl mb-2" style={{ color: colors.deepRosewood }}>Greek Excellence</h3>
               </div>
            </div>
            <p className="font-sleek text-sm leading-relaxed mb-4" style={{ color: colors.mutedMauve }}>Exquisite designs honoring D9 and Panhellenic organizations.</p>
            <span className="font-sleek text-xs tracking-widest uppercase pb-1 border-b" style={{ color: colors.petalGlaze, borderColor: colors.petalGlaze }}>Explore</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const CollectionPage = ({ categoryKey, title, description, setCurrentView, showToast, addToCart, cart, products }) => {
  const categoryProducts = products[categoryKey];

  return (
    <div className="py-20 bg-[#FCFBFB] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center font-sleek text-sm tracking-widest uppercase mb-12 hover:opacity-60 transition-opacity"
          style={{ color: colors.deepRosewood }}
        >
          <ChevronLeft size={16} className="mr-2" strokeWidth={1} /> Back to Home
        </button>

        <div className="border-b pb-12 mb-12 flex flex-col items-center text-center" style={{ borderColor: colors.lavenderBlush }}>
          <h2 className="text-5xl font-elegant mb-6" style={{ color: colors.deepRosewood }}>{title}</h2>
          <p className="font-sleek text-lg max-w-2xl font-light" style={{ color: colors.mutedMauve }}>{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {categoryProducts?.map((item) => {
            const available = item.inventory;

            return (
              <div key={item.id} className="group">
                <div className="aspect-[3/4] mb-6 relative overflow-hidden bg-white border border-[#F4DFE6] p-4">
                  <div className="w-full h-full flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105" 
                       style={{ 
                         backgroundColor: item.img_color || item.imgColor, 
                         backgroundImage: item.image_url ? `url(${item.image_url})` : 'none',
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                         opacity: item.image_url ? 1 : 0.15 
                       }}>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-elegant text-xl mb-1" style={{ color: colors.deepRosewood }}>{item.name}</h3>
                    <div className="flex items-center gap-3">
                      <p className="font-sleek text-sm" style={{ color: colors.mutedMauve }}>{item.price}</p>
                      {available > 0 ? (
                        <span className="font-sleek text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color: colors.mossGreen, borderColor: colors.sorbetStem, backgroundColor: '#F9FBF4' }}>
                          {available === 1 ? '1 Available' : `${available} Available`}
                        </span>
                      ) : (
                        <span className="font-sleek text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color: colors.dustyOrchid, borderColor: colors.lavenderBlush, backgroundColor: colors.powderedLilac }}>
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => available > 0 && addToCart(item)} 
                    disabled={available <= 0}
                    className={`p-2 transition-colors rounded-none ${available > 0 ? 'hover:bg-[#F4DFE6] cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                  >
                    <ShoppingBag size={18} strokeWidth={1} style={{ color: colors.deepRosewood }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const InventoryRow = ({ item, category, onSave, onDelete }) => {
  const [editItem, setEditItem] = useState(item);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    setEditItem(item);
  }, [item]);

  const hasChanges = JSON.stringify(editItem) !== JSON.stringify(item);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
    
    const imageUrl = publicUrlData.publicUrl;

    setEditItem({
      ...editItem,
      image_url: imageUrl,
      img_color: '#F3EEF1'
    });
    setUploading(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <input
          type="text"
          value={editItem.name}
          onChange={e => setEditItem({...editItem, name: e.target.value})}
          className="w-full bg-transparent border-b focus:outline-none focus:border-[#D56989] py-1"
          style={{ borderColor: hasChanges ? colors.dustyOrchid : 'transparent' }}
        />
       </td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={editItem.price}
          onChange={e => setEditItem({...editItem, price: e.target.value})}
          className="w-16 bg-transparent border-b focus:outline-none focus:border-[#D56989] py-1"
          style={{ borderColor: hasChanges ? colors.dustyOrchid : 'transparent' }}
        />
       </td>
      <td className="px-6 py-4">
        <input
          type="number"
          value={editItem.inventory}
          onChange={e => setEditItem({...editItem, inventory: parseInt(e.target.value) || 0})}
          className="w-16 bg-transparent border-b focus:outline-none focus:border-[#D56989] py-1"
          style={{ borderColor: hasChanges ? colors.dustyOrchid : 'transparent' }}
        />
       </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {editItem.image_url && (
            <img
              src={editItem.image_url}
              alt="preview"
              className="w-12 h-12 object-cover rounded border"
            />
          )}
          <div className="flex-1">
            <input
              type="text"
              value={editItem.image_url || editItem.img_color || editItem.imgColor}
              placeholder="Hex Color or Image URL"
              onChange={e => {
                const val = e.target.value;
                if (val.startsWith('http')) {
                  setEditItem({...editItem, image_url: val, img_color: '#F3EEF1'});
                } else {
                  setEditItem({...editItem, img_color: val, image_url: ''});
                }
              }}
              className="w-full bg-transparent border-b focus:outline-none focus:border-[#D56989] py-1"
              style={{ borderColor: hasChanges ? colors.dustyOrchid : 'transparent' }}
            />
            <label className="text-xs text-[#D56989] cursor-pointer hover:underline">
              {uploading ? 'Uploading...' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
       </td>
      <td className="px-6 py-4 text-right space-x-2">
        {hasChanges ? (
          <button
            onClick={() => onSave(category, editItem)}
            className="text-[10px] uppercase tracking-widest text-white px-4 py-2 rounded shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.dustyOrchid }}
          >
            Save
          </button>
        ) : (
          <span className="text-[10px] uppercase tracking-widest text-gray-400">Saved</span>
        )}
        <button
          onClick={() => onDelete(category, item.id)}
          className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700"
          title="Delete product"
        >
          <Trash2 size={14} />
        </button>
       </td>
    </tr>
  );
};

const CustomOrderPage = ({ setCurrentView, showToast }) => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 30);
  const minDateString = minDate.toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', date: '', details: '', notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const html = `
      <h2>New Custom Inquiry</h2>
      <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Needed By:</strong> ${formData.date}</p>
      <p><strong>Details/Colors:</strong> ${formData.details}</p>
      <p><strong>Notes:</strong> ${formData.notes}</p>
    `;
    
    await sendResendEmail('New Custom Inquiry from ' + formData.firstName, html);
    
    await supabase.from('inquiries').insert({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      needed_by: formData.date,
      details: formData.details,
    });
    
    setIsSubmitting(false);
    showToast("Inquiry sent! We will be in touch shortly.");
    setTimeout(() => setCurrentView('home'), 3000);
  };
  return (
    <div className="py-20 bg-[#FCFBFB] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center font-sleek text-sm tracking-widest uppercase mb-12 hover:opacity-60 transition-opacity"
          style={{ color: colors.deepRosewood }}
        >
          <ChevronLeft size={16} className="mr-2" strokeWidth={1} /> Back to Home
        </button>
        <div className="text-center mb-16">
          <h2 className="text-5xl font-elegant mb-6" style={{ color: colors.deepRosewood }}>Custom Inquiry</h2>
          <p className="font-sleek text-lg max-w-2xl mx-auto font-light" style={{ color: colors.mutedMauve }}>
            Looking for specific colors, a unique organization, or a personalized touch? Tell us about your vision.
          </p>
          <p className="font-sleek text-sm mt-6 uppercase tracking-widest font-medium" style={{ color: colors.dustyOrchid }}>
            Please note: We require at least 30 days notice to complete all custom orders.
          </p>
        </div>
        <div className="bg-white border p-8 md:p-12 shadow-sm" style={{ borderColor: colors.lavenderBlush }}>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] transition-colors font-sleek" style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }} />
              </div>
              <div>
                <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] transition-colors font-sleek" style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] transition-colors font-sleek" style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }} />
              </div>
              <div>
                <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Graduation Date / Needed By</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required min={minDateString} className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] transition-colors font-sleek uppercase text-sm" style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }} />
              </div>
            </div>
            <div>
              <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>School, Organization, or Desired Colors</label>
              <input type="text" name="details" value={formData.details} onChange={handleChange} placeholder="e.g., FSU, Delta Sigma Theta, Sage & Blush..." className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] transition-colors font-sleek placeholder-opacity-40" style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }} />
            </div>
            <div>
              <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Design Details</label>
              <textarea rows="4" name="notes" value={formData.notes} onChange={handleChange} placeholder="Tell us more about what you're looking for..." className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] transition-colors font-sleek placeholder-opacity-40 resize-none" style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }}></textarea>
            </div>
            <div className="pt-4 text-center">
              <button type="submit" disabled={isSubmitting} className="font-sleek text-sm tracking-widest uppercase py-4 px-12 border transition-all hover:bg-[#F4DFE6] disabled:opacity-50" style={{ color: colors.deepRosewood, borderColor: colors.deepRosewood }}>
                {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CartPage = ({ cart, setCart, setCurrentView, showToast }) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('zelle');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + parseInt(item.price.replace('$', '')), 0);
  const shippingFee = 0; // Free shipping
  const fee = paymentMethod === 'zelle' ? 0 : (subtotal + shippingFee) * 0.03;

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = (subtotal + shippingFee) * (appliedDiscount.value / 100);
    } else {
      discountAmount = appliedDiscount.value;
    }
  }
  const grandTotal = subtotal + shippingFee + fee - discountAmount;

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyDiscount = async () => {
    setDiscountError('');
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', discountCode.toUpperCase())
      .single();

    if (error || !data) {
      setDiscountError('Invalid discount code');
      return;
    }

    // Check expiry and usage
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setDiscountError('Discount code expired');
      return;
    }
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      setDiscountError('Discount code usage limit reached');
      return;
    }

    setAppliedDiscount(data);
    setDiscountCode('');
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const itemsForDb = cart.map(item => ({
      id: item.id,
      quantity: 1,
    }));
    const orderNumber = `ORD-${Date.now()}`;

    const shippingAddress = {
      street: formData.street,
      street2: formData.street2 || null,
      city: formData.city,
      state: formData.state,
      zip: formData.zip
    };

    const { error } = await supabase.rpc('create_order_and_update_inventory', {
      order_number: orderNumber,
      customer_name: formData.fullName,
      customer_email: formData.email,
      items: itemsForDb,
      total: `$${grandTotal.toFixed(2)}`,
      payment_method: paymentMethod,
      delivery_method: 'shipping',
      shipping_address: shippingAddress,
    });

    if (error) {
      setIsSubmitting(false);
      showToast('Error placing order. Please try again.');
      console.error(error);
      return;
    }

    const cartHtml = cart.map(item => `<li>${item.name} - ${item.price}</li>`).join('');
    let discountHtml = '';
    if (appliedDiscount) {
      discountHtml = `<p><strong>Discount (${appliedDiscount.code}):</strong> -$${discountAmount.toFixed(2)}</p>`;
    }
    const html = `
      <h2>New Order Request</h2>
      <p><strong>Name:</strong> ${formData.fullName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Shipping Address:</strong><br/>
      ${formData.street}<br/>
      ${formData.street2 ? formData.street2 + '<br/>' : ''}
      ${formData.city}, ${formData.state} ${formData.zip}</p>
      <h3>Items:</h3>
      <ul>${cartHtml}</ul>
      <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
      <p><strong>Shipping:</strong> Free</p>
      <p><strong>App Processing Fee:</strong> $${fee.toFixed(2)}</p>
      ${discountHtml}
      <p><strong>Total:</strong> $${grandTotal.toFixed(2)}</p>
    `;

    await sendResendEmail('New Order Request from ' + formData.fullName, html);

    setIsSubmitting(false);
    showToast(`Order placed! Inventory updated. We'll contact you to complete payment.`);
    setCart([]);
    setCurrentView('home');
  };

  return (
    <div className="py-20 bg-[#FCFBFB] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center font-sleek text-sm tracking-widest uppercase mb-12 hover:opacity-60 transition-opacity"
          style={{ color: colors.deepRosewood }}
        >
          <ChevronLeft size={16} className="mr-2" strokeWidth={1} /> Continue Shopping
        </button>
        <h2 className="text-4xl font-elegant mb-12 border-b pb-6" style={{ color: colors.deepRosewood, borderColor: colors.lavenderBlush }}>
          {isCheckout ? "Complete Request" : "Your Selection"}
        </h2>
        {cart.length === 0 ? (
          <p className="font-sleek text-lg" style={{ color: colors.mutedMauve }}>Your cart is beautifully empty.</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between mb-6 pb-6 border-b" style={{ borderColor: colors.powderedLilac }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white border flex-shrink-0" style={{ borderColor: colors.lavenderBlush, backgroundColor: item.img_color || item.imgColor, opacity: 0.2 }}></div>
                    <div>
                      <h4 className="font-elegant text-lg" style={{ color: colors.deepRosewood }}>{item.name}</h4>
                      <p className="font-sleek text-sm" style={{ color: colors.mutedMauve }}>{item.price}</p>
                    </div>
                  </div>
                  {!isCheckout && (
                    <button onClick={() => removeFromCart(index)} className="text-xs font-sleek uppercase tracking-widest hover:text-red-500 transition-colors" style={{ color: colors.mutedMauve }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            <div className="w-full md:w-80 bg-white border p-6 h-fit" style={{ borderColor: colors.lavenderBlush }}>
              {!isCheckout ? (
                <>
                  <div className="flex justify-between mb-4 font-sleek text-sm" style={{ color: colors.deepRosewood }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4 font-sleek text-sm" style={{ color: colors.deepRosewood }}>
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <button
                    onClick={() => setIsCheckout(true)}
                    className="w-full mt-6 py-4 font-sleek text-xs tracking-widest uppercase text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: colors.dustyOrchid }}
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  <div>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange} placeholder="Full Name" required className="w-full bg-transparent border-b py-2 focus:outline-none font-sleek text-sm" style={{ borderColor: colors.mutedMauve }} />
                  </div>
                  <div>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email Address" required className="w-full bg-transparent border-b py-2 focus:outline-none font-sleek text-sm" style={{ borderColor: colors.mutedMauve }} />
                  </div>
                  <div className="pt-4 border-t" style={{ borderColor: colors.powderedLilac }}>
                    <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Shipping Address</label>
                    <input type="text" name="street" value={formData.street} onChange={handleFormChange} placeholder="Street Address" required className="w-full bg-transparent border-b py-2 mb-3 focus:outline-none font-sleek text-sm" style={{ borderColor: colors.mutedMauve }} />
                    <input type="text" name="street2" value={formData.street2} onChange={handleFormChange} placeholder="Apt, Suite, etc. (optional)" className="w-full bg-transparent border-b py-2 mb-3 focus:outline-none font-sleek text-sm" style={{ borderColor: colors.mutedMauve }} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="city" value={formData.city} onChange={handleFormChange} placeholder="City" required className="w-full bg-transparent border-b py-2 focus:outline-none font-sleek text-sm" style={{ borderColor: colors.mutedMauve }} />
                      <input type="text" name="state" value={formData.state} onChange={handleFormChange} placeholder="State" required className="w-full bg-transparent border-b py-2 focus:outline-none font-sleek text-sm" style={{ borderColor: colors.mutedMauve }} />
                    </div>
                    <input type="text" name="zip" value={formData.zip} onChange={handleFormChange} placeholder="ZIP Code" required className="w-full bg-transparent border-b py-2 mt-3 focus:outline-none font-sleek text-sm" style={{ borderColor: colors.mutedMauve }} />
                  </div>
                  <div className="pt-4 border-t" style={{ borderColor: colors.powderedLilac }}>
                    <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-transparent border py-2 px-3 focus:outline-none font-sleek text-sm mb-2"
                      style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }}
                    >
                      <option value="zelle">Zelle (No Fee)</option>
                      <option value="cashapp">CashApp (+3% Fee)</option>
                      <option value="venmo">Venmo (+3% Fee)</option>
                      <option value="paypal">PayPal (+3% Fee)</option>
                    </select>
                  </div>

                  {/* Discount section */}
                  <div className="pt-4 border-t" style={{ borderColor: colors.powderedLilac }}>
                    {!appliedDiscount ? (
                      <div>
                        <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Discount Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="Enter code"
                            className="flex-1 bg-transparent border-b py-2 focus:outline-none font-sleek text-sm"
                            style={{ borderColor: colors.mutedMauve }}
                          />
                          <button
                            type="button"
                            onClick={applyDiscount}
                            className="text-xs font-sleek uppercase tracking-widest text-white px-4 py-2 rounded shadow-sm hover:opacity-90"
                            style={{ backgroundColor: colors.dustyOrchid }}
                          >
                            Apply
                          </button>
                        </div>
                        {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-sleek" style={{ color: colors.deepRosewood }}>
                          Discount: {appliedDiscount.code} (-{appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `$${appliedDiscount.value}`})
                        </span>
                        <button
                          type="button"
                          onClick={removeDiscount}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t space-y-2 font-sleek text-sm" style={{ borderColor: colors.powderedLilac, color: colors.deepRosewood }}>
                    <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
                    {fee > 0 && <div className="flex justify-between text-red-400"><span>App Processing Fee</span><span>${fee.toFixed(2)}</span></div>}
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 text-lg"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 py-4 font-sleek text-xs tracking-widest uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.deepRosewood }}
                  >
                    {isSubmitting ? 'Processing...' : 'Submit Order Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminLogin = ({ setCurrentView, showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      showToast('Invalid email or password');
    } else {
      showToast('Welcome, Admin.');
      setCurrentView('admin-dashboard');
    }
  };
  return (
    <div className="min-h-screen bg-[#F3EEF1] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 stripe-bg opacity-30"></div>
      <div className="max-w-md w-full bg-white border p-10 relative z-10 shadow-xl" style={{ borderColor: colors.lavenderBlush }}>
        <div className="text-center mb-10">
          <Lock size={32} strokeWidth={1} className="mx-auto mb-4" style={{ color: colors.dustyOrchid }} />
          <h2 className="text-3xl font-elegant" style={{ color: colors.deepRosewood }}>Admin Portal</h2>
          <p className="font-sleek text-sm mt-2" style={{ color: colors.mutedMauve }}>Sign in to manage your store.</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] font-sleek text-sm"
              style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }}
              placeholder="admin@satinandstem.shop"
            />
          </div>
          <div>
            <label className="block font-sleek text-xs tracking-widest uppercase mb-2" style={{ color: colors.deepRosewood }}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b py-2 focus:outline-none focus:border-[#D56989] font-sleek text-sm"
              style={{ borderColor: colors.mutedMauve, color: colors.deepRosewood }}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full mt-6 py-3 font-sleek text-xs tracking-widest uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: colors.deepRosewood }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button onClick={() => setCurrentView('home')} className="mt-8 text-center w-full font-sleek text-xs uppercase tracking-widest hover:text-[#D56989] transition-colors" style={{ color: colors.mutedMauve }}>
          &larr; Return to Storefront
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ setCurrentView, showToast, products, setProducts, comingSoon, setComingSoon }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [updatingInquiry, setUpdatingInquiry] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState({ code: '', type: 'percentage', value: '', expires_at: '', usage_limit: '' });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const allowedEmail = 'satinandstem@protonmail.com';
      if (!session || session?.user?.email !== allowedEmail) {
        setCurrentView('admin-login');
        showToast('Please log in to access the dashboard.');
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*');
      if (!error) setOrders(data || []);
    };
    const fetchInquiries = async () => {
      const { data, error } = await supabase.from('inquiries').select('*');
      if (!error) setInquiries(data || []);
    };
    fetchOrders();
    fetchInquiries();
  }, []);

  useEffect(() => {
    const fetchDiscounts = async () => {
      const { data, error } = await supabase.from('discounts').select('*');
      if (!error) setDiscounts(data || []);
    };
    if (activeTab === 'discounts') fetchDiscounts();
  }, [activeTab]);

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order ${orderId} status updated to ${newStatus}.`);
    }
  };

  const getStatusColor = (status) => {
    if (status?.includes('Completed') || status?.includes('Shipped')) return 'border-blue-200 bg-blue-50 text-blue-700';
    if (status?.includes('Paid')) return 'border-green-200 bg-green-50 text-green-700';
    return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  };

  const handleProductUpdate = async (category, updatedItem) => {
    const { error } = await supabase
      .from('products')
      .update({
        name: updatedItem.name,
        price: updatedItem.price,
        inventory: updatedItem.inventory,
        img_color: updatedItem.img_color || updatedItem.imgColor,
        image_url: updatedItem.image_url || null,
      })
      .eq('id', updatedItem.id);
    if (error) {
      showToast('Error updating product');
    } else {
      const updatedCategory = products[category].map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      setProducts({ ...products, [category]: updatedCategory });
      showToast(`${updatedItem.name} updated successfully.`);
    }
  };

  const handleAddProduct = async (category) => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: "New Product",
        price: "$0",
        description: "Description here.",
        img_color: "#F3EEF1",
        inventory: 0,
        category: category,
      })
      .select()
      .single();
    if (error) {
      showToast('Error adding product');
    } else {
      setProducts({ ...products, [category]: [data, ...products[category]] });
      showToast("New product added.");
    }
  };

  const handleDeleteProduct = async (category, productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product? This cannot be undone.');
    if (!confirmed) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      showToast('Error deleting product');
      console.error(error);
    } else {
      const updatedCategory = products[category].filter(item => item.id !== productId);
      setProducts({ ...products, [category]: updatedCategory });
      showToast('Product deleted successfully.');
    }
  };

  const handleReply = (inquiry) => {
    window.location.href = `mailto:${inquiry.email}?subject=Re: Your Satin & Stem custom inquiry`;
  };

  const handleMarkAsRead = async (inquiry) => {
    const confirmed = window.confirm(`Did you reply to ${inquiry.name}? Mark this inquiry as "Responded"?`);
    if (!confirmed) return;

    setUpdatingInquiry(inquiry.id);
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'Responded' })
      .eq('id', inquiry.id);
    setUpdatingInquiry(null);

    if (error) {
      showToast('Error updating inquiry status');
    } else {
      setInquiries(inquiries.map(i => i.id === inquiry.id ? { ...i, status: 'Responded' } : i));
      showToast(`Inquiry from ${inquiry.name} marked as responded.`);
    }
  };

  const handleCreateDiscount = async () => {
    const { data, error } = await supabase
      .from('discounts')
      .insert({
        code: newDiscount.code.toUpperCase(),
        type: newDiscount.type,
        value: parseFloat(newDiscount.value),
        expires_at: newDiscount.expires_at || null,
        usage_limit: newDiscount.usage_limit ? parseInt(newDiscount.usage_limit) : null,
      })
      .select();
    if (error) {
      showToast('Error creating discount');
    } else {
      setDiscounts([...discounts, data[0]]);
      setNewDiscount({ code: '', type: 'percentage', value: '', expires_at: '', usage_limit: '' });
      showToast('Discount created');
    }
  };

  const handleDeleteDiscount = async (id) => {
    const confirmed = window.confirm('Delete this discount?');
    if (!confirmed) return;
    const { error } = await supabase.from('discounts').delete().eq('id', id);
    if (!error) {
      setDiscounts(discounts.filter(d => d.id !== id));
      showToast('Discount deleted');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r min-h-screen flex flex-col" style={{ borderColor: '#EAEAEA' }}>
        <div className="p-6 border-b" style={{ borderColor: '#EAEAEA' }}>
          <span className="font-elegant text-2xl tracking-wide" style={{ color: colors.dustyOrchid }}>Satin & Stem</span>
          <p className="font-sleek text-xs mt-1 uppercase tracking-widest text-gray-400">Admin Dashboard</p>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 font-sleek text-sm tracking-wide">
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-[#F4DFE6]/40 text-[#4A373C] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Package size={18} strokeWidth={1.5} /> <span>Order Requests</span>
          </button>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'inquiries' ? 'bg-[#F4DFE6]/40 text-[#4A373C] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            <MessageSquare size={18} strokeWidth={1.5} /> <span>Custom Inquiries</span>
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-[#F4DFE6]/40 text-[#4A373C] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutDashboard size={18} strokeWidth={1.5} /> <span>Inventory</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-[#F4DFE6]/40 text-[#4A373C] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Settings size={18} strokeWidth={1.5} /> <span>Site Status</span>
          </button>
          <button onClick={() => setActiveTab('discounts')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'discounts' ? 'bg-[#F4DFE6]/40 text-[#4A373C] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Tag size={18} strokeWidth={1.5} /> <span>Discounts</span>
          </button>
        </div>
        <div className="p-4 border-t" style={{ borderColor: '#EAEAEA' }}>
          <button onClick={async () => { await supabase.auth.signOut(); showToast('Logged out securely.'); setCurrentView('home'); }} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-red-500 transition-colors font-sleek text-sm">
            <LogOut size={18} strokeWidth={1.5} /> <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 overflow-y-auto h-screen">
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-3xl font-elegant mb-2" style={{ color: colors.deepRosewood }}>Order Requests</h2>
            <p className="font-sleek text-sm text-gray-500 mb-8">Review incoming orders and update their fulfillment status.</p>
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden" style={{ borderColor: '#EAEAEA' }}>
              <table className="w-full text-left font-sleek text-sm">
                <thead className="bg-gray-50 border-b text-xs uppercase tracking-widest text-gray-500" style={{ borderColor: '#EAEAEA' }}>
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Payment</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Delivery</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#EAEAEA' }}>
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium" style={{ color: colors.deepRosewood }}>{order.order_number}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.customer_name}<br/>
                        <span className="text-xs text-gray-400">{order.items?.map(i => i.name).join(', ')}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{order.payment_method}</td>
                      <td className="px-6 py-4 text-gray-600">{order.total}</td>
                      <td className="px-6 py-4 text-gray-600">{order.delivery_method}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full border cursor-pointer focus:outline-none ${getStatusColor(order.status)}`}
                        >
                          <option value="Pending Payment">Pending Payment</option>
                          <option value="Paid - In Production">Paid - In Production</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div>
            <h2 className="text-3xl font-elegant mb-2" style={{ color: colors.deepRosewood }}>Custom Inquiries</h2>
            <p className="font-sleek text-sm text-gray-500 mb-8">Review and respond to special requests.</p>
            <div className="grid grid-cols-1 gap-6">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`bg-white border p-6 rounded-lg shadow-sm transition-all ${inq.status === 'Responded' ? 'opacity-60 grayscale-[0.1] bg-gray-50' : ''}`}
                  style={{ borderColor: '#EAEAEA' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-elegant text-xl" style={{ color: colors.deepRosewood }}>{inq.name}</h4>
                      <p className="font-sleek text-xs uppercase tracking-widest text-red-400 mt-1">Needed by: {inq.needed_by}</p>
                      <p className="font-sleek text-xs text-gray-400 mt-1">Email: {inq.email}</p>
                    </div>
                    <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full border"
                          style={{
                            backgroundColor: inq.status === 'Responded' ? '#e2e8f0' : '#dbeafe',
                            borderColor: inq.status === 'Responded' ? '#cbd5e1' : '#bfdbfe',
                            color: inq.status === 'Responded' ? '#4b5563' : '#1e40af'
                          }}>
                      {inq.status === 'Responded' ? 'Responded' : 'Unread'}
                    </span>
                  </div>
                  <p className="font-sleek text-sm text-gray-600 leading-relaxed border-l-2 pl-4" style={{ borderColor: colors.powderedLilac }}>
                    "{inq.details}"
                  </p>
                  <div className="mt-6 pt-4 border-t flex justify-end space-x-4" style={{ borderColor: '#EAEAEA' }}>
                    <button
                      onClick={() => handleReply(inq)}
                      className="text-xs font-sleek uppercase tracking-widest text-white px-4 py-2 rounded shadow-sm hover:opacity-90"
                      style={{ backgroundColor: colors.dustyOrchid }}
                    >
                      Reply
                    </button>
                    {inq.status !== 'Responded' && (
                      <button
                        onClick={() => handleMarkAsRead(inq)}
                        disabled={updatingInquiry === inq.id}
                        className="text-xs font-sleek uppercase tracking-widest text-gray-500 hover:text-gray-800 disabled:opacity-50"
                      >
                        {updatingInquiry === inq.id ? 'Updating...' : 'Mark as Read (Email Sent?)'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-3xl font-elegant mb-8" style={{ color: colors.deepRosewood }}>Inventory Management</h2>
            {Object.entries(products).map(([category, items]) => (
              <div key={category} className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-elegant capitalize" style={{ color: colors.deepRosewood }}>{category} Collection</h3>
                  <button onClick={() => handleAddProduct(category)} className="text-xs font-sleek uppercase tracking-widest text-gray-600 hover:text-[#D56989] transition-colors border px-3 py-1 rounded" style={{ borderColor: '#EAEAEA' }}>+ Add</button>
                </div>
                <div className="bg-white border rounded-lg shadow-sm overflow-x-auto" style={{ borderColor: '#EAEAEA' }}>
                  <table className="w-full text-left font-sleek text-sm min-w-[800px]">
                    <thead className="bg-gray-50 border-b text-xs uppercase tracking-widest text-gray-500" style={{ borderColor: '#EAEAEA' }}>
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Visual (Color/URL)</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#EAEAEA' }}>
                      {items.map((item) => (
                        <InventoryRow
                          key={item.id}
                          item={item}
                          category={category}
                          onSave={handleProductUpdate}
                          onDelete={handleDeleteProduct}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-3xl font-elegant mb-2" style={{ color: colors.deepRosewood }}>Site Status</h2>
            <div className="bg-white border p-6 rounded-lg" style={{ borderColor: '#EAEAEA' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-elegant text-xl">Coming Soon Mode</h3>
                  <p className="font-sleek text-sm text-gray-500">When enabled, visitors see a "Coming Soon" page.</p>
                </div>
                <button
                  onClick={async () => {
                    const newValue = !comingSoon;
                    const { error } = await supabase
                      .from('settings')
                      .update({ value: newValue })
                      .eq('key', 'coming_soon');
                    if (!error) {
                      setComingSoon(newValue);
                      showToast(`Coming soon mode ${newValue ? 'enabled' : 'disabled'}.`);
                    } else {
                      showToast('Error updating setting.');
                    }
                  }}
                  className={`px-4 py-2 rounded text-sm font-sleek uppercase tracking-widest ${comingSoon ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                >
                  {comingSoon ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discounts' && (
          <div>
            <h2 className="text-3xl font-elegant mb-2" style={{ color: colors.deepRosewood }}>Discounts</h2>
            <p className="font-sleek text-sm text-gray-500 mb-8">Manage promotional discount codes.</p>
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8" style={{ borderColor: '#EAEAEA' }}>
              <div className="p-6 border-b" style={{ borderColor: '#EAEAEA' }}>
                <h3 className="font-elegant text-lg mb-4">Create New Discount</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Code"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                    className="border rounded px-3 py-2 font-sleek text-sm"
                    style={{ borderColor: '#EAEAEA' }}
                  />
                  <select
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                    className="border rounded px-3 py-2 font-sleek text-sm"
                    style={{ borderColor: '#EAEAEA' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Value"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                    className="border rounded px-3 py-2 font-sleek text-sm"
                    style={{ borderColor: '#EAEAEA' }}
                  />
                  <input
                    type="date"
                    placeholder="Expires At"
                    value={newDiscount.expires_at}
                    onChange={(e) => setNewDiscount({ ...newDiscount, expires_at: e.target.value })}
                    className="border rounded px-3 py-2 font-sleek text-sm"
                    style={{ borderColor: '#EAEAEA' }}
                  />
                  <input
                    type="number"
                    placeholder="Usage Limit"
                    value={newDiscount.usage_limit}
                    onChange={(e) => setNewDiscount({ ...newDiscount, usage_limit: e.target.value })}
                    className="border rounded px-3 py-2 font-sleek text-sm"
                    style={{ borderColor: '#EAEAEA' }}
                  />
                </div>
                <button
                  onClick={handleCreateDiscount}
                  disabled={!newDiscount.code || !newDiscount.value}
                  className="mt-4 px-6 py-2 text-sm font-sleek uppercase tracking-widest text-white rounded shadow-sm hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.dustyOrchid }}
                >
                  Create Discount
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sleek text-sm">
                  <thead className="bg-gray-50 border-b text-xs uppercase tracking-widest text-gray-500" style={{ borderColor: '#EAEAEA' }}>
                    <tr>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Expires At</th>
                      <th className="px-6 py-4">Usage Limit</th>
                      <th className="px-6 py-4">Used Count</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#EAEAEA' }}>
                    {discounts.map((discount) => (
                      <tr key={discount.id}>
                        <td className="px-6 py-4 font-medium">{discount.code}</td>
                        <td className="px-6 py-4">{discount.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                        <td className="px-6 py-4">{discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}</td>
                        <td className="px-6 py-4">{discount.expires_at ? new Date(discount.expires_at).toLocaleDateString() : 'Never'}</td>
                        <td className="px-6 py-4">{discount.usage_limit || '∞'}</td>
                        <td className="px-6 py-4">{discount.used_count || 0}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteDiscount(discount.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Footer = ({ showToast, setActiveModal, setCurrentView }) => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t" style={{ borderColor: colors.lavenderBlush }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <span className="font-elegant text-3xl tracking-wide mb-6 block" style={{ color: colors.deepRosewood }}>
              Satin & Stem
            </span>
            <p className="font-sleek text-sm leading-relaxed max-w-sm mb-8" style={{ color: colors.mutedMauve }}>
              Handcrafted ribbon and faux botanical leis originating in Tallahassee, Florida.
            </p>
            <div className="flex space-x-6">
              <a href="https://instagram.com/__satinandstem" target="_blank" rel="noreferrer" className="hover:text-[#D56989] transition-colors" style={{ color: colors.deepRosewood }}><Instagram size={18} strokeWidth={1.5} /></a>
              <a href="mailto:satinandstem@protonmail.com" className="hover:text-[#D56989] transition-colors" style={{ color: colors.deepRosewood }}><Mail size={18} strokeWidth={1.5} /></a>
            </div>
          </div>
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="font-sleek text-xs tracking-widest uppercase mb-6" style={{ color: colors.deepRosewood }}>Explore</h4>
            <ul className="space-y-4 font-sleek text-sm" style={{ color: colors.mutedMauve }}>
              <li><button onClick={() => setCurrentView('classic')} className="hover:text-[#D56989] transition-colors">Collections</button></li>
              <li><button onClick={() => setCurrentView('custom')} className="hover:text-[#D56989] transition-colors">Custom Inquiry</button></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="font-sleek text-xs tracking-widest uppercase mb-6" style={{ color: colors.deepRosewood }}>Stay Connected</h4>
            <p className="font-sleek text-sm mb-4" style={{ color: colors.mutedMauve }}>Join the list for elegant restocks and exclusive previews.</p>
            <form className="flex border-b" style={{ borderColor: colors.deepRosewood }} onSubmit={(e) => { e.preventDefault(); showToast("Welcome to the list."); }}>
              <input type="email" placeholder="Email Address" className="flex-grow py-2 bg-transparent focus:outline-none font-sleek text-sm placeholder-opacity-50" style={{ color: colors.deepRosewood }} />
              <button type="submit" className="px-4 font-sleek text-xs tracking-widest uppercase hover:text-[#D56989] transition-colors" style={{ color: colors.deepRosewood }}>Submit</button>
            </form>
          </div>
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center font-sleek text-xs tracking-wider uppercase" style={{ color: colors.mutedMauve }}>
          <p>&copy; {new Date().getFullYear()} Satin & Stem. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-[#D56989]">Privacy</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-[#D56989]">Terms</button>
            <button onClick={() => setCurrentView('admin-login')} className="ml-4 opacity-20 hover:opacity-100 transition-opacity" title="Admin Portal"><Lock size={12} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Coming Soon Page Component ---
const ComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-[#FCFBFB] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <span className="font-elegant text-6xl tracking-wide" style={{ color: colors.dustyOrchid }}>
            Satin & Stem
          </span>
        </div>
        <h1 className="font-elegant text-4xl md:text-6xl mb-6" style={{ color: colors.deepRosewood }}>
          Coming Soon
        </h1>
        <p className="font-sleek text-lg text-gray-600 mb-8">
          We're preparing something beautiful for you. 
          Be the first to know when we launch.
        </p>
        <div className="inline-block border-b border-[#D56989] pb-1">
          <span className="font-sleek text-sm tracking-widest uppercase" style={{ color: colors.dustyOrchid }}>
            Follow us on Instagram
          </span>
        </div>
      </div>
    </div>
  );
};

// ---------- Main App Component ----------
export default function App() {
  const [toastMessage, setToastMessage] = useState('');
  const [currentView, setCurrentView] = useState('home');
  const [cart, setCart] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [products, setProducts] = useState({ classic: [], collegiate: [], greek: [] });
  const [comingSoon, setComingSoon] = useState(false);

  // Fetch products from Supabase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        const grouped = {
          classic: data.filter(p => p.category === 'classic'),
          collegiate: data.filter(p => p.category === 'collegiate'),
          greek: data.filter(p => p.category === 'greek'),
        };
        setProducts(grouped);
      } else {
        // Fallback to mock data if Supabase is not ready
        setProducts(initialProducts);
      }
    };
    fetchProducts();
  }, []);

  // Fetch coming soon setting
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'coming_soon')
        .single();
      if (!error && data) {
        setComingSoon(data.value);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    showToast(`Added ${product.name} to Cart`);
  };

  const isPublicView = !currentView.startsWith('admin');

  // Coming soon mode: show coming soon page unless admin route
  if (comingSoon && !currentView.startsWith('admin')) {
    return <ComingSoonPage />;
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen bg-[#FCFBFB] font-sans text-gray-900 relative">
        {isPublicView && <Navbar showToast={showToast} currentView={currentView} setCurrentView={setCurrentView} cart={cart} />}
        
        {currentView === 'home' && (
          <>
            <HeroSection setCurrentView={setCurrentView} />
            <CollectionsSection setCurrentView={setCurrentView} />
          </>
        )}

        {currentView === 'classic' && (
          <CollectionPage categoryKey="classic" title="The Classic Collection" description="Our foundational line featuring soft romantic hues and timeless ivory ribbons." setCurrentView={setCurrentView} showToast={showToast} addToCart={addToCart} cart={cart} products={products} />
        )}

        {currentView === 'collegiate' && (
          <CollectionPage categoryKey="collegiate" title="Collegiate Heritage" description="Elegant interpretations of university pride, meticulously crafted for Florida's finest." setCurrentView={setCurrentView} showToast={showToast} addToCart={addToCart} cart={cart} products={products} />
        )}

        {currentView === 'greek' && (
          <CollectionPage categoryKey="greek" title="Greek Excellence" description="Sophisticated designs honoring the legacy and colors of D9 and Panhellenic organizations." setCurrentView={setCurrentView} showToast={showToast} addToCart={addToCart} cart={cart} products={products} />
        )}

        {currentView === 'custom' && <CustomOrderPage setCurrentView={setCurrentView} showToast={showToast} />}
        {currentView === 'cart' && <CartPage cart={cart} setCart={setCart} setCurrentView={setCurrentView} showToast={showToast} />}

        {currentView === 'admin-login' && <AdminLogin setCurrentView={setCurrentView} showToast={showToast} />}
        {currentView === 'admin-dashboard' && <AdminDashboard setCurrentView={setCurrentView} showToast={showToast} products={products} setProducts={setProducts} comingSoon={comingSoon} setComingSoon={setComingSoon} />}

        {isPublicView && <Footer showToast={showToast} setActiveModal={setActiveModal} setCurrentView={setCurrentView} />}

        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white p-8 max-w-md w-full border shadow-2xl relative" style={{ borderColor: colors.lavenderBlush }}>
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 hover:opacity-50 transition-opacity" style={{ color: colors.deepRosewood }}><X size={20} strokeWidth={1} /></button>
              <h3 className="font-elegant text-3xl mb-4" style={{ color: colors.deepRosewood }}>{activeModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}</h3>
              <p className="font-sleek text-sm leading-relaxed" style={{ color: colors.mutedMauve }}>We respect your privacy. Contact information is used solely for order fulfillment.</p>
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
            <div className="px-8 py-4 shadow-lg font-sleek text-sm tracking-widest uppercase flex items-center space-x-3 border" style={{ backgroundColor: '#FCFBFB', color: colors.deepRosewood, borderColor: colors.lavenderBlush }}>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}