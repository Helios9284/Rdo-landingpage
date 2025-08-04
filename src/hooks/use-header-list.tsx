import type { HederListType } from "@/types";
import { useTranslation } from 'react-i18next';

export const userHeaderList = () => {
    const { t } = useTranslation()
    const headerList: HederListType[] = [
        {
            text: t('header.MAIN'),
            href: '/',
            id: 1,
        },
        {
            text: t('header.DOC'),
            href: '/document',
            id: 2,
        },
        {
            text: t('header.LOGIN'),
            href: '/login',
            id: 3,
        },
    ]
    return { headerList }
}