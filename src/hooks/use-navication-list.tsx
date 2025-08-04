
import type { NavigationListType } from "@/types";
import { useTranslation } from 'react-i18next';
import { GrTransaction } from "react-icons/gr";
import { PiVaultLight } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { PiHouseLineLight, PiBankThin } from "react-icons/pi";
import { CiLock } from "react-icons/ci";

export const useNavigationList = () => {
    const { t } = useTranslation()
    const navigationList: NavigationListType[] = [
        {
            text: t('navigation.DASHBOARD'),
            icon: <PiHouseLineLight size='1.2em' />,
            href: '/',
            id: 1,
          },
        {
        text: t('navigation.PORTFOLIO'),
        icon: <PiBankThin size='1.2em' />,
        href: '/portfolio',
        id: 2,
        },
        {
            text: t('navigation.VAULT'),
            icon: <CiLock size='1.2em' />,
            href: '/vault',
            id: 3,
        },
        {
            text: t('navigation.HISTORY'),
            icon: <GrTransaction size='1.2em' />,
            href: '/transactions',
            id: 4,
        },
        {
            text: t('navigation.AVAILABLE'),
            icon: <PiVaultLight size='1.2em' />,
            href: '/availablevault',
            id: 5,
        },
        {
            text: t('navigation.DOC'),
            icon: <HiOutlineDocumentText size='1.2em' />,
            href: '/document',
            id: 7,
        },
        {
            text: t('navigation.SETTINGS'),
            icon: <CgProfile size='1.2em' />,
            href: '/profile',
            id: 8,
        },
    ]
    return { navigationList }
}