import { Metadata } from "next"
import { FeedbackForm } from "../../components/feedback/FeedbackForm"

export const metadata: Metadata = {
    title: "意见反馈",
    description: "分享您对100工具集合的建议和反馈",
}

export default function FeedbackPage() {
    return <FeedbackForm />
}