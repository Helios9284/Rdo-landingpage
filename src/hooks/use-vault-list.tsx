
import type { VaultListType } from "@/types";
import { useTranslation } from 'react-i18next';


export const vaultActivityList = () => {
    const { t } = useTranslation()
    const vaultList: VaultListType[] = [
        {
            text: t('vault.OVERVIEW'),
            href: "",
            id: 1,
          },
        {
            text: t('vault.ACTIVITY'),
            href: "",
            id: 2,
        },
        {
            text: t('vault.SECURITY'),
            href: "",
            id: 3,
        }
    ]
    return { vaultList }
}