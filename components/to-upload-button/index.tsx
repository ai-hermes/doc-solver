import { useRouter } from "next/router"
import { Icons } from "../shared/icons"
import { Button } from "@/components/ui/button"
import { useSession } from 'next-auth/react';
import { toast } from "../ui/use-toast";

interface ToUploadButtonProps {}

export function ToUploadButton({ }: ToUploadButtonProps) {
    const router = useRouter()
    const { data: session } = useSession()

    const onClick = () => {
        if(!session?.user) {
            return toast({
                title: "Permission Error.",
                description: "login first please ~",
                variant: "destructive",
            })
        }
        router.push(`/embedding`)
    }

    return (
        <div className="flex justify-center items-center p-3">
            <Button variant={'ghost'} onClick={onClick}>
                <Icons.upload className="w-5 mr-1" />
                Add Files
            </Button>
        </div>
    )
}
