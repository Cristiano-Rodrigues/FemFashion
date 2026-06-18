'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, CreditCard, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck, Phone } from 'lucide-react';
import { CartItem, Endereco } from '@/types';
import { DatabaseService } from '@/services/db';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (variantId: string, q: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
  currentUser: any;
  onOpenAuth: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOpenAuth
}: CartProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment-pending' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'MCX_EXPRESS' | 'UNITEL_MONEY'>('MCX_EXPRESS');
  
  // Checkout address form
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [telefone, setTelefone] = useState('');
  
  // MCX Express Payment simulations
  const [mcxPhone, setMcxPhone] = useState('');
  const [mcxTimer, setMcxTimer] = useState(45);
  const [unitelPhone, setUnitelPhone] = useState('');
  const [unitelPin, setUnitelPin] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.variante.preco * item.quantidade), 0);
  const taxaEntrega = subtotal > 150000 ? 0 : 3500; // Free delivery above 150.000 Kz
  const total = subtotal + taxaEntrega;

  // Angola provinces list
  const PROVINCIAS_ANGOLA = [
    'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Lunda Norte', 
    'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
  ];

  // Load user details if logged in
  useEffect(() => {
    if (currentUser) {
      setTelefone(currentUser.telefone || '');
      DatabaseService.getAddressesForUser(currentUser.id).then(addresses => {
        const defaultAddr = addresses.find(a => a.padrao) || addresses[0];
        if (defaultAddr) {
          setProvincia(defaultAddr.provincia);
          setMunicipio(defaultAddr.municipio);
          setBairro(defaultAddr.bairro);
          setRua(defaultAddr.rua);
        }
      });
    }
  }, [currentUser]);

  // Payment confirmation timer
  useEffect(() => {
    let timer: any;
    if (step === 'payment-pending' && paymentMethod === 'MCX_EXPRESS' && mcxTimer > 0) {
      timer = setTimeout(() => {
        setMcxTimer(prev => prev - 1);
      }, 1000);
    } else if (mcxTimer === 0 && step === 'payment-pending') {
      setStep('checkout');
      setCheckoutError('Tempo limite excedido para confirmação de pagamento. Tente novamente.');
    }
    return () => clearTimeout(timer);
  }, [step, mcxTimer, paymentMethod]);

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('AOA', 'Kz');
  };

  const startCheckout = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setStep('checkout');
  };

  const handleCreateMockOrder = async () => {
    setCheckoutError(null);
    if (!municipio || !bairro || !rua) {
      setCheckoutError('Por favor, preencha todos os campos do endereço de entrega.');
      return;
    }

    if (paymentMethod === 'MCX_EXPRESS' && (!mcxPhone || mcxPhone.length < 9)) {
      setCheckoutError('Por favor, insira um número Multicaixa Express válido (9 dígitos).');
      return;
    }

    if (paymentMethod === 'UNITEL_MONEY' && (!unitelPhone || unitelPhone.length < 9 || unitelPin.length < 4)) {
      setCheckoutError('Por favor, insira um número Unitel Money válido e seu PIN de 4 dígitos.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Address first if not already matching
      const address = await DatabaseService.createAddress(
        currentUser.id,
        provincia,
        municipio,
        bairro,
        rua,
        true
      );

      if (paymentMethod === 'MCX_EXPRESS') {
        // Trigger push notification screen simulation
        setIsProcessing(false);
        setMcxTimer(45);
        setStep('payment-pending');
        
        // Log event
        DatabaseService.logEvent('checkout_espera_mcx', '/checkout', null, { total, telf: mcxPhone });
      } else {
        // Unitel Money direct verification animation
        setTimeout(async () => {
          const { order, error } = await DatabaseService.createOrder(
            currentUser.id,
            address.id,
            cartItems,
            subtotal,
            taxaEntrega,
            total,
            'UNITEL_MONEY'
          );

          setIsProcessing(false);

          if (error) {
            setCheckoutError(error);
          } else {
            setCreatedOrder(order);
            setStep('success');
            onClearCart();
            DatabaseService.logEvent('compra_sucesso', '/checkout', null, { orderId: order?.id, total });
          }
        }, 2000);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setCheckoutError(err.message || 'Erro ao processar checkout. Tente novamente.');
    }
  };

  // Simulates that user typed the PIN on their phone
  const simulatePaymentApproval = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const addresses = await DatabaseService.getAddressesForUser(currentUser.id);
      const activeAddr = addresses[0] || { id: 'e1' };

      const { order, error } = await DatabaseService.createOrder(
        currentUser.id,
        activeAddr.id,
        cartItems,
        subtotal,
        taxaEntrega,
        total,
        'MCX_EXPRESS'
      );

      setIsProcessing(false);

      if (error) {
        setStep('checkout');
        setCheckoutError(error);
      } else {
        setCreatedOrder(order);
        setStep('success');
        onClearCart();
        DatabaseService.logEvent('compra_sucesso', '/checkout', null, { orderId: order?.id, total });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setStep('checkout');
      setCheckoutError(err.message || 'Erro de simulação. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="shopping-cart-container">
      {/* Backdrop overlay */}
      <div 
        onClick={step !== 'payment-pending' && !isProcessing ? onClose : undefined} 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
      />

      {/* Cart Slider Box */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header toolbar */}
        <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-serif font-bold text-stone-900 uppercase tracking-widest">
              {step === 'cart' && 'O Seu Carrinho'}
              {step === 'checkout' && 'Finalizar Compra'}
              {step === 'payment-pending' && 'Autorizar Pagamento'}
              {step === 'success' && 'Pedido Confirmado!'}
            </h2>
          </div>
          <button 
            disabled={isProcessing}
            onClick={onClose} 
            className="p-1 rounded-full text-stone-400 hover:text-stone-950 hover:bg-stone-200 transition disabled:opacity-50"
            id="close-cart-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CART LIST VIEW */}
        {step === 'cart' && (
          <>
            <div className="flex-grow overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 my-4">
                  <ShoppingBag className="w-12 h-12 text-stone-300 stroke-[1.25] mb-4" />
                  <p className="font-serif font-bold text-stone-800 text-lg">O seu carrinho está vazio</p>
                  <p className="text-xs text-stone-400 max-w-xs mt-1 leading-relaxed">
                    Adicione belas perucas, vestidos de festa e malas exclusivas das nossas coleções para brilhar.
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-full text-xs font-mono tracking-widest uppercase transition duration-150"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {cartItems.map((item) => {
                    const imgUrl = item.produto.imagens[0]?.url || 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=100';
                    return (
                      <div key={item.variante.id} className="py-4 flex gap-4 animate-in fade-in duration-200">
                        <img 
                          src={imgUrl} 
                          alt={item.produto.nome} 
                          className="w-20 h-20 object-cover rounded-lg bg-stone-50 border border-stone-100 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-serif font-bold text-stone-900 group-hover:text-amber-600 line-clamp-1">{item.produto.nome}</h4>
                              <button 
                                onClick={() => onRemoveItem(item.variante.id)}
                                className="text-stone-400 hover:text-red-600 p-0.5 transition"
                                title="Remover item"
                                id={`remove-item-${item.variante.id}-btn`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] font-mono text-amber-700 font-medium">
                              {item.variante.designativo || `${item.variante.tamanho || ''} - ${item.variante.cor || ''}`}
                            </p>
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                              Stock: {item.variante.quantidade_stock} disp.
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center border border-stone-200 rounded-full py-0.5 px-2 bg-stone-50">
                              <button 
                                onClick={() => onUpdateQuantity(item.variante.id, item.quantidade - 1)}
                                className="text-stone-500 hover:text-stone-900 p-1"
                                id={`qty-minus-${item.variante.id}-btn`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 min-w-[20px] text-center text-xs font-semibold text-stone-900 font-mono">
                                {item.quantidade}
                              </span>
                              <button 
                                onClick={() => onUpdateQuantity(item.variante.id, item.quantidade + 1)}
                                className="text-stone-500 hover:text-stone-900 p-1"
                                id={`qty-plus-${item.variante.id}-btn`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs font-serif font-black text-stone-950 font-mono">
                              {formatKz(item.variante.preco * item.quantidade)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-stone-100 bg-stone-50 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-600 font-mono uppercase">
                    <span>Subtotal</span>
                    <span>{formatKz(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600 font-mono uppercase">
                    <span>Taxa de Entrega</span>
                    <span>{taxaEntrega === 0 ? 'Grátis' : formatKz(taxaEntrega)}</span>
                  </div>
                  {taxaEntrega > 0 && (
                    <p className="text-[10px] text-stone-400 text-right leading-none pb-1">
                      Envio Grátis para compras acima de {formatKz(150000)}
                    </p>
                  )}
                  <div className="border-t border-stone-200 pt-3 flex justify-between text-stone-950">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">Total Estimado</span>
                    <span className="text-xl font-serif font-black text-amber-600 font-mono">{formatKz(total)}</span>
                  </div>
                </div>

                <button
                  onClick={startCheckout}
                  className="w-full py-3 bg-[#1D1B18] hover:bg-amber-600 text-white rounded-full text-xs font-mono tracking-widest uppercase font-bold flex justify-center items-center gap-2 shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
                  id="checkout-proceed-btn"
                >
                  Proceder para o Pagamento
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: SHIPPING AND GATEWAY SELECTION */}
        {step === 'checkout' && (
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Checkout Alert/Error messages */}
              {checkoutError && (
                <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2.5 border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{checkoutError}</p>
                </div>
              )}

              {/* Delivery Address Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest border-b border-stone-100 pb-2">
                  1. Endereço de Entrega (Angola)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Província</label>
                    <select
                      value={provincia}
                      onChange={(e) => setProvincia(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                    >
                      {PROVINCIAS_ANGOLA.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Município *</label>
                    <input
                      type="text"
                      placeholder="Ex: Belas, Viana"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Bairro *</label>
                    <input
                      type="text"
                      placeholder="Ex: Talatona, Patriota"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Telefone de Contacto *</label>
                    <input
                      type="text"
                      placeholder="Ex: 923 000 000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Rua / Prédio / Casa *</label>
                  <textarea
                    placeholder="Indique a rua, condomínio, nº de casa, detalhes de referência..."
                    rows={2}
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Payment Methods Choice */}
              <div className="space-y-4">
                <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest border-b border-stone-100 pb-2">
                  2. Método de Pagamento
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Multicaixa Express */}
                  <label 
                    onClick={() => setPaymentMethod('MCX_EXPRESS')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition ${
                      paymentMethod === 'MCX_EXPRESS' 
                        ? 'border-amber-600 bg-amber-50/40 text-stone-900 font-bold' 
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <span className="font-mono text-xs tracking-wider uppercase font-black text-blue-800">MCX Express</span>
                    <span className="text-[10px] text-stone-500 mt-1">Ref. telemóvel</span>
                  </label>

                  {/* Unitel Money */}
                  <label 
                    onClick={() => setPaymentMethod('UNITEL_MONEY')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition ${
                      paymentMethod === 'UNITEL_MONEY' 
                        ? 'border-amber-600 bg-amber-50/40 text-stone-900 font-bold' 
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <span className="font-mono text-xs tracking-wider uppercase font-black text-amber-600">Unitel Money</span>
                    <span className="text-[10px] text-stone-500 mt-1">PIN Telefone</span>
                  </label>
                </div>

                {/* Sub-inputs dependent on chosen payment method */}
                {paymentMethod === 'MCX_EXPRESS' ? (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-blue-700" />
                      <span className="text-xs font-serif font-bold text-blue-900">Configuração Multicaixa Express</span>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-blue-700 uppercase tracking-wider mb-1">Número do Telefone Adesão Express</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-blue-700 font-mono font-medium">+244</span>
                        <input
                          type="number"
                          placeholder="9XXXXXXXX"
                          value={mcxPhone}
                          onChange={(e) => setMcxPhone(e.target.value)}
                          className="w-full bg-white border border-blue-200 rounded-lg py-2 pl-14 pr-3 text-xs focus:outline-none focus:border-blue-600 font-mono"
                        />
                      </div>
                      <p className="text-[9px] text-blue-600 mt-1">
                        Será espoletada uma notificação fictícia de pagamento no seu ecrã para validar o checkout.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-serif font-bold text-amber-900">Credenciais Unitel Money</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-amber-700 uppercase tracking-wider mb-1">Telemóvel Unitel</label>
                        <input
                          type="number"
                          placeholder="9XXXXXXXX"
                          value={unitelPhone}
                          onChange={(e) => setUnitelPhone(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-amber-700 uppercase tracking-wider mb-1">PIN Carteira (4 Dígitos)</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          value={unitelPin}
                          onChange={(e) => setUnitelPin(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono text-center tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust badges protection indicator */}
              <div className="p-3 bg-stone-50 rounded-lg flex items-center gap-2 justify-center border border-stone-100">
                <ShieldCheck className="w-4 h-4 text-stone-500" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Pagamento 100% Protegido e Encriptado</span>
              </div>
            </div>

            {/* Total summary footer order button */}
            <div className="border-t border-stone-100 bg-stone-50 p-6 space-y-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-stone-600 font-mono uppercase">Montante final cobrar</span>
                <span className="text-lg font-serif font-black text-amber-600 font-mono">{formatKz(total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setStep('cart')}
                  className="w-full py-2.5 border border-stone-300 text-stone-700 rounded-full text-xs font-mono tracking-wider uppercase hover:bg-white transition disabled:opacity-50"
                >
                  Voltar ao Carrinho
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCreateMockOrder}
                  className="w-full py-2.5 bg-amber-600 text-white rounded-full text-xs font-mono tracking-wider uppercase font-bold hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isProcessing ? 'Verificando...' : 'Confirmar e Pagar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: INTERACTIVE MULTICAIXA EXPRESS VERIFICATION NOTIFICATION SIMULATOR */}
        {step === 'payment-pending' && (
          <div className="flex-grow flex flex-col justify-center items-center px-6 py-12 bg-blue-900 text-white h-full">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-stone-900 shadow-2xl border-4 border-stone-900/65 relative animate-bounce">
              <div className="w-12 h-1 bg-stone-300 rounded mx-auto mb-4" />
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-blue-700" />
                </div>
                <h4 className="font-serif font-black text-base text-blue-900">NOTIFICAÇÃO EXPRESS</h4>
                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest mt-0.5">MOCK PAY SERVICE</p>
              </div>

              <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs">
                <p className="leading-relaxed">
                  Enviamos um pedido de autorização de débito para o número <span className="font-mono font-bold">+244 {mcxPhone}</span>.
                </p>
                <div className="flex justify-between border-t border-stone-200/60 pt-2 font-mono">
                  <span className="text-stone-400 font-normal">Entidade:</span>
                  <span className="font-bold">femfashion Lda</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-stone-400 font-normal">Valor:</span>
                  <span className="font-bold text-amber-700">{formatKz(total)}</span>
                </div>
                <div className="text-center text-red-600 bg-red-50 p-2 rounded text-[10px] font-semibold animate-pulse font-mono uppercase">
                  A aguardar resposta no telemóvel: {mcxTimer}s
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={simulatePaymentApproval}
                  disabled={isProcessing}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  id="mcx-approve-simulator-btn"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-white" />
                  {isProcessing ? 'Verificando stock...' : 'Simular Aprovação (PIN Ok)'}
                </button>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-[10px] font-mono uppercase transition text-center"
                >
                  Cancelar Operação
                </button>
              </div>
            </div>

            <p className="text-xs text-blue-200 font-serif leading-relaxed mt-12 max-w-xs text-center font-light">
              Este ecrã simula a notificação push real que receberia no Multicaixa Express oficial de Angola. Carregue no botão para finalizar!
            </p>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT AND DETAILS */}
        {step === 'success' && (
          <div className="flex-grow flex flex-col overflow-y-auto px-6 py-12 justify-center items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <h3 className="text-2xl font-serif font-black text-stone-900 tracking-wide">
              Compra Concluída!
            </h3>
            <p className="text-xs text-amber-600 font-mono tracking-widest uppercase font-semibold mt-1">
              Ref ID / Pedido: #{createdOrder?.id?.substring(0, 8)}
            </p>

            <div className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-5 my-6 text-left space-y-3">
              <h5 className="text-[10px] font-mono text-stone-400 uppercase tracking-widest border-b border-stone-200/60 pb-1">
                Recibo de Compra
              </h5>
              
              <div className="divide-y divide-stone-200/40 text-xs">
                {cartItems.map((item, id) => (
                  <div key={id} className="py-2 flex justify-between font-serif">
                    <span className="text-stone-700 max-w-[200px] truncate">
                      {item.produto.nome} ({item.variante.designativo || item.variante.tamanho}) x{item.quantidade}
                    </span>
                    <span className="font-mono text-stone-950">{formatKz(item.variante.preco * item.quantidade)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatKz(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Entrega Express</span>
                  <span>{taxaEntrega === 0 ? 'Grátis' : formatKz(taxaEntrega)}</span>
                </div>
                <div className="flex justify-between text-stone-950 font-bold bg-amber-500/10 p-2 rounded border border-amber-500/15">
                  <span className="uppercase">Total Final</span>
                  <span>{formatKz(total)}</span>
                </div>
              </div>

              <div className="bg-stone-100/70 p-3 rounded-lg text-[10px] space-y-1 font-mono text-stone-500 leading-tight">
                <p className="font-semibold text-stone-700">COORDENADAS DE ENVIO:</p>
                <p>Província: {provincia} - Município: {municipio}</p>
                <p>Bairro: {bairro} - Contacto: {telefone}</p>
                <p className="truncate">Rua: {rua}</p>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed font-light max-w-sm mb-6">
              Obrigado pela sua preferência! O seu stock foi reduzido em stock e a equipa de processamento iniciará o envio para a sua morada.
            </p>

            <button
              onClick={() => {
                setStep('cart');
                onClose();
              }}
              className="px-8 py-3 bg-[#1D1B18] hover:bg-amber-600 text-white rounded-full text-xs font-mono uppercase tracking-widest font-semibold shadow-md transition duration-200 cursor-pointer"
            >
              Continuar a Comprar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
