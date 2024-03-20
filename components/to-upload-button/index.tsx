import { useRouter } from "next/router"
import { Icons } from "../shared/icons"
import { Button } from "@/components/ui/button"

interface ToUploadButtonProps {}

export function ToUploadButton({ }: ToUploadButtonProps) {
    const router = useRouter()

    return (
        <div className="flex justify-center items-center p-3">
            <Button variant={'ghost'} onClick={() => router.push(`/upload`)}>
                <Icons.upload className="w-5 mr-1" />
                Add Files
            </Button>
        </div>
    )
}
