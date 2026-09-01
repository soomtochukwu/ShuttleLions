'use client';

import { useState, useEffect } from 'react';
import { supabase, type ShopProduct, type Profile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { formatKobo } from '@/lib/constants';
import { ShoppingBag, ShieldCheck, Truck, Sparkles, Check } from 'lucide-react';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';

export default function ShopPage() {
  const { user } = useAuth();
  const { showAlert } = useFeedback();

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [executives, setExecutives] = useState<Profile[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [assignedExecId, setAssignedExecId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadShop() {
      const { data: prodData } = await supabase.from('shop_products').select('*');
      setProducts(prodData || []);

      const { data: execData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'captain']);
      setExecutives(execData || []);
      if (execData?.[0]) setAssignedExecId(execData[0].id);
    }
    loadShop();
  }, []);

  const handleOpenProcurement = (product: ShopProduct) => {
    audio.play('rally');
    setSelectedProduct(product);
    setIsProcurementModalOpen(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user?.id) return;

    setIsSubmitting(true);
    audio.play('smash');

    try {
      await supabase.from('shop_orders').insert({
        profile_id: user.id,
        product_id: selectedProduct.id,
        quantity: 1,
        total_price_kobo: selectedProduct.price_kobo,
        assigned_executive_id: assignedExecId || null,
        status: 'pending',
        notes: notes.trim() || null,
      });

      audio.play('whistle');
      setIsProcurementModalOpen(false);
      setNotes('');
      showAlert({
        title: 'Procurement Submitted! 🏸',
        message: `Your order for "${selectedProduct.name}" has been routed to the executive logistics coordinator for purchase and court handoff.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Order error:', err);
      showAlert({
        title: 'Procurement Error',
        message: 'Failed to submit procurement request. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-black uppercase text-sl-green tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sl-green-glow" /> OFFICIAL YONEX & ATHLETIC PRO SHOP
        </span>
        <h1
          className="text-2xl sm:text-4xl font-black uppercase text-sl-foreground"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          🏸 Equipment & Executive Logistics
        </h1>
        <p className="text-xs sm:text-sm text-sl-muted max-w-2xl font-medium">
          Order professional badminton rackets, feather shuttles, and grips. Have a verified team executive purchase and deliver them directly to your court session.
        </p>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => (
          <TiltCard key={prod.id} className="p-6 bg-sl-panel flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase bg-sl-green/15 text-sl-green px-2.5 py-0.5 rounded-full border border-sl-green/30">
                  {prod.brand} • {prod.category}
                </span>
                <span className="text-xs font-mono font-bold text-sl-green">
                  {prod.stock_status === 'in_stock' ? 'In Stock' : 'Pre-order'}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h3 className="text-lg font-black text-sl-foreground">{prod.name}</h3>
                <p className="text-2xl font-black text-sl-green font-mono mt-1">
                  {formatKobo(prod.price_kobo)}
                </p>
              </div>

              <p className="text-xs text-sl-muted leading-relaxed font-medium">
                {prod.description}
              </p>

              {/* Specs List */}
              {prod.specs && (
                <div className="bg-sl-bg p-3 rounded-xl border border-sl-border space-y-1 text-[11px] font-semibold">
                  {Object.entries(prod.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sl-muted">{key}:</span>
                      <span className="text-sl-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA: Pay an Executive to Procure */}
            <ShuttleButton
              variant="green"
              onClick={() => handleOpenProcurement(prod)}
              className="w-full py-3 text-xs font-black shadow-md flex items-center justify-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Request Executive Pickup 🛒</span>
            </ShuttleButton>
          </TiltCard>
        ))}
      </div>

      {/* Executive Procurement Modal */}
      <ShuttleModal
        isOpen={isProcurementModalOpen}
        onClose={() => setIsProcurementModalOpen(false)}
        title="Executive Equipment Procurement"
      >
        {selectedProduct && (
          <form onSubmit={handleConfirmOrder} className="space-y-4">
            <div className="p-4 bg-sl-bg rounded-2xl border border-sl-border space-y-1">
              <span className="text-[10px] font-bold text-sl-green uppercase">Selected Item</span>
              <h4 className="text-sm font-black text-sl-foreground">{selectedProduct.name}</h4>
              <p className="text-lg font-black text-sl-green font-mono">
                {formatKobo(selectedProduct.price_kobo)}
              </p>
            </div>

            {/* Select Executive */}
            <ShuttleSelect
              label="Assign Executive / Captain for Purchase"
              value={assignedExecId}
              onChange={(e) => setAssignedExecId(e.target.value)}
              options={executives.map((ex) => ({
                value: ex.id,
                label: `${ex.full_name} (${ex.role === 'captain' ? 'Team Captain' : 'Executive'})`,
              }))}
            />

            {/* Delivery / Grip Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-sl-foreground uppercase">
                Custom String Tension / Delivery Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please string at 26 lbs with neon yellow grip. Handoff on Saturday drill."
                className="w-full p-3 rounded-xl bg-sl-bg border border-sl-border text-xs text-sl-foreground focus:outline-none focus:border-sl-green resize-none h-20"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <ShuttleButton
                type="button"
                variant="white"
                onClick={() => setIsProcurementModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </ShuttleButton>
              <ShuttleButton
                type="submit"
                variant="green"
                disabled={isSubmitting}
                className="flex-1 font-black"
              >
                {isSubmitting ? 'Confirming...' : 'Submit Order ⚡'}
              </ShuttleButton>
            </div>
          </form>
        )}
      </ShuttleModal>
    </div>
  );
}
