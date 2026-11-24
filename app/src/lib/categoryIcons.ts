import { Banknote, HandCoins, Handshake, Package, Store, ReceiptText, Briefcase, Car, CreditCard, Film, Gift, GraduationCap, HeartPulse, House, Landmark, PiggyBank, Receipt, ShoppingBag, ShoppingBasket, Smartphone, Tag, TrendingUp, Utensils, Wallet, Zap, ArrowLeftRight, type LucideIcon } from 'lucide-react';
import type { Category, WalletType } from '../data/types';

const BY_KEY: Record<string, LucideIcon> = {
  salary: Banknote, bonus: Gift, business: Briefcase, investment: TrendingUp, giftIn: Gift, otherIncome: Banknote,
  food: Utensils, groceries: ShoppingBasket, transport: Car, housing: House, utilities: Zap, shopping: ShoppingBag,
  sales: Store, loanIn: HandCoins, debtCollected: Handshake, stock: Package, opex: ReceiptText, debtPaid: HandCoins, loanOut: Handshake,
  health: HeartPulse, education: GraduationCap, entertainment: Film, bills: Receipt, otherExpense: Tag,
};
export const categoryIcon = (c?: Category): LucideIcon => (c?.key && BY_KEY[c.key]) || Tag;
export const transferIcon = ArrowLeftRight;

const BY_WALLET: Record<WalletType, LucideIcon> = { cash: Banknote, bank: Landmark, ewallet: Smartphone, credit: CreditCard, savings: PiggyBank, investment: TrendingUp, other: Wallet };
export const walletIcon = (t: WalletType): LucideIcon => BY_WALLET[t] ?? Wallet;

/** Filled icon tile in an entity colour (category or wallet), white glyph: the shared icon-container style. */
export const fillTile = (color: string) => ({ background: `linear-gradient(150deg, color-mix(in srgb, ${color} 88%, #fff) 0%, ${color} 55%, color-mix(in srgb, ${color} 80%, #000) 100%)`, color: '#fff' });
/** Tinted tile: dark container, glyph in the entity colour (budgets, quieter lists). */
export const tintTile = (color: string) => ({ background: `color-mix(in srgb, ${color} 16%, var(--surface-2))`, color: `color-mix(in srgb, ${color} 70%, #fff)` });
export const TRANSFER_COLOR = '#5b5bd6';
