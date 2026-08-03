import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [seller, setSeller] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('listings').select('*').eq('id', id).single()
      setListing(data)
      if (data?.seller_id) {
        const { data: sellerData } = await supabase.from('profiles').select('*').eq('id', data.seller_id).single()
        setSeller(sellerData)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-20 opacity-60">Loadingâ€¦</div>
  if (!listing) return <div className="max-w-6xl mx-auto px-4 py-20 opacity-60">Listing not found.</div>

  function handleBuy() {
    if (!user) { navigate('/login'); return }
    navigate(`/checkout/${listing.id}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[var(--color-ink-3)] mb-3">
          {listing.image_urls?.[activeImg] ? (
            <img src={listing.image_urls[activeImg]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-40">No photo</div>
          )}
        </div>
        {listing.image_urls?.length > 1 && (
          <div className="flex gap-2">
            {listing.image_urls.map((url, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border ${i === activeImg ? 'border-[var(--color-gold)]' : 'border-white/15'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl mb-2">{listing.title}</h1>
        <div className="text-2xl mb-4" style={{ color: 'var(--color-terracotta)' }}>KSh {Number(listing.price).toLocaleString()}</div>

        <div className="flex flex-wrap gap-2 mb-6 text-xs">
          <span className="px-3 py-1 rounded-full border border-white/15">{listing.condition}</span>
          <span className="px-3 py-1 rounded-full border border-white/15 capitalize">{listing.category}</span>
          {listing.size && <span className="px-3 py-1 rounded-full border border-white/15">Size {listing.size}</span>}
        </div>

        <p className="opacity-80 leading-relaxed mb-8 whitespace-pre-line">{listing.description}</p>

        {seller && (
          <div className="p-4 rounded-2xl border border-white/10 mb-8">
            <div className="text-sm font-medium">{seller.full_name}</div>
            <div className="text-xs opacity-60 capitalize">{seller.seller_type?.replace('_', ' ')} Â· {seller.verification_status === 'verified' ? 'âœ“ Verified seller' : 'Verification pending'}</div>
          </div>
        )}

        <div className="p-4 rounded-2xl mb-6 text-sm" style={{ background: 'var(--color-ink-3)', border: '1px solid var(--color-line)' }}>
          <span style={{ color: 'var(--color-teal)' }} className="font-medium">Escrow protected - </span>
          your payment is held until you confirm the item matches this listing.
        </div>

        <button
          onClick={handleBuy}
          className="w-full py-3 rounded-full font-medium"
          style={{ background: 'var(--color-terracotta)', color: '#0E0F0D' }}
        >
          Buy with escrow protection
        </button>
      </div>
    </div>
  )
}