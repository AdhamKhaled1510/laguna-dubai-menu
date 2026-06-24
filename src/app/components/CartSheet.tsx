import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { MenuItemType } from './MenuItem';
import logoUrl from '@/assets/logo.png';

interface CartItem {
  item: MenuItemType;
  quantity: number;
}

interface CartSheetProps {
  cartItems: CartItem[];
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartSheet({ cartItems, onRemoveItem, onClearCart, onCheckout }: CartSheetProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg" className="fixed bottom-6 left-6 h-16 px-8 text-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black shadow-xl rounded-2xl z-50 transition-transform duration-300 active:scale-95">
          <ShoppingCart className="ml-2 h-6 w-6" />
          السلة ({totalItems})
          {totalPrice > 0 && (
            <Badge variant="secondary" className="mr-3 text-base px-3 py-1 bg-white/20 text-white border border-white/30">
              {totalPrice} ج.م
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-lg flex flex-col bg-gradient-to-b from-white to-rose-50/30 border-r border-rose-100 text-stone-700">
        <SheetHeader className="text-right flex flex-col items-center">
          <img src={logoUrl} alt="Laguna Dubai" className="h-16 w-auto mb-2" />
          <SheetTitle className="text-2xl font-black bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">سلة الطلبات</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <img src={logoUrl} alt="Laguna Dubai" className="h-24 w-auto mx-auto mb-4 opacity-15" />
              <p className="text-xl font-bold text-rose-300">السلة فارغة</p>
              <p className="text-sm mt-2 text-rose-200">ابدأ بإضافة مشروبات لذيذة من المنيو</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-4">
                {cartItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-20 h-20 object-cover rounded-lg border border-rose-100"
                    />
                    <div className="flex-1 text-right">
                      <h4 className="font-bold text-stone-700 mb-1">{item.nameAr}</h4>
                      <div className="text-sm text-rose-300 mb-2">
                        {item.price} ج.م × {quantity}
                      </div>
                      <div className="font-black bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
                        {item.price * quantity} ج.م
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 text-red-300 hover:text-red-400 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4 bg-rose-100" />

            <div className="space-y-3 text-right mb-4">
              <div className="flex justify-between text-lg">
                <span className="font-black bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">{totalPrice} ج.م</span>
                <span className="text-rose-400">المجموع:</span>
              </div>
              <div className="flex justify-between text-sm text-rose-300">
                <span>{totalItems}</span>
                <span>عدد الأصناف:</span>
              </div>
            </div>

            <SheetFooter className="gap-2 flex-col sm:flex-col">
              <Button
                onClick={onCheckout}
                size="lg"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-lg h-14 rounded-xl shadow-sm"
              >
                تأكيد الطلب وإرسال لواتساب
              </Button>
              <Button
                onClick={onClearCart}
                variant="outline"
                size="lg"
                className="w-full border-rose-200 hover:bg-rose-50 text-rose-400"
              >
                <Trash2 className="ml-2 h-5 w-5" />
                إفراغ السلة
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
