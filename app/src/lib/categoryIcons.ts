import { Banknote, Briefcase, Car, CreditCard, Film, Gift, GraduationCap, HeartPulse, House, Landmark, PiggyBank, Receipt, ShoppingBag, ShoppingBasket, Smartphone, Tag, TrendingUp, Utensils, Wallet, Zap, ArrowLeftRight, type LucideIcon } from 'lucide-react';
import type { Category, WalletType } from '../data/types';

const BY_KEY: Record<string, LucideIcon> = {
  salary: Banknote, bonus: Gift, business: Briefcase, investment: TrendingUp, giftIn: Gift, otherIncome: Banknote,
  food: Utensils, groceries: ShoppingBasket, transport: Car, housing: House, utilities: Zap, shopping: ShoppingBag,
  health: HeartPulse, education: GraduationCap, entertainment: Film, bills: Receipt, otherExpense: Tag,
};
export const categoryIcon = (c?: Category): LucideIcon => (c?.key && BY_KEY[c.key]) || Tag;
export const transferIcon = ArrowLeftRight;

const BY_WALLET: Record<WalletType, LucideIcon> = { cash: Banknote, bank: Landmark, ewallet: Smartphone, credit: CreditCard, savings: PiggyBank, investment: TrendingUp, other: Wallet };
export const walletIcon = (t: WalletType): LucideIcon => BY_WALLET[t] ?? Wallet;
