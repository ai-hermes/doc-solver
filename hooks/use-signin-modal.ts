import { atom, useAtom } from 'jotai'
const signinModalValuesAtom = atom({
    isOpen: false,
})

export function useSigninModal() {
    const [signinModalValues, setSigninModalValuesAtom] = useAtom(signinModalValuesAtom)
    return {
        isOpen: signinModalValues.isOpen,
        onOpen: () => {
            setSigninModalValuesAtom({
                ...signinModalValues,
                isOpen: true
            })
        },
        onClose: () => {
            setSigninModalValuesAtom({
                ...signinModalValues,
                isOpen: false
            })
        }
    }
}