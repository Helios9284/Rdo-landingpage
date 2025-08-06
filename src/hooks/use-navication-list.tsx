
import type { NavigationListType } from "@/types";
import { useTranslation } from 'react-i18next';

export const useNavigationList = () => {
    const { t } = useTranslation()
    const navigationList: NavigationListType[] = [
        {
            text: t('navigation.TRADE'),
            href: '/',
            id: 1,
          },
        {
        text: t('navigation.PORTFOLIO'),
        href: '/portfolio',
        id: 2,
        },
        {
            text: t('navigation.MARKET'),
            href: '/vault',
            id: 3,
        }
    ]
    return { navigationList }
}