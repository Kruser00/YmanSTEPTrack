import { FoodItem, ActivityLevel } from './types';

export const ACTIVITY_LEVELS: { [key in ActivityLevel]: { label: string; value: number } } = {
  sedentary: { label: 'بی‌تحرک (کار اداری)', value: 1.2 },
  light: { label: 'فعالیت سبک (ورزش ۱-۳ روز در هفته)', value: 1.375 },
  moderate: { label: 'فعالیت متوسط (ورزش ۳-۵ روز در هفته)', value: 1.55 },
  active: { label: 'فعالیت زیاد (ورزش ۶-۷ روز در هفته)', value: 1.725 },
  very_active: { label: 'بسیار فعال (ورزش سنگین، کار فیزیکی)', value: 1.9 },
};

export const GOALS: { [key in 'lose' | 'maintain' | 'gain']: { label: string; modifier: number } } = {
    lose: { label: 'کاهش وزن', modifier: -500 },
    maintain: { label: 'حفظ وزن', modifier: 0 },
    gain: { label: 'افزایش وزن', modifier: 500 },
};