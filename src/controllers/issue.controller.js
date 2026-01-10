import { createIssue, getAllIssue, getAiDesc, getIssue } from "#src/services/issue.service.js"
import logger from "#src/utils/logger.js"
import { createIssueSchema } from "#src/validations/issue.validation.js"

export const creatingIssue=async(req,res)=>{
    const userId=req.user?.id
    const orgId=req.params.orgId

    try {
        const {name,description,imgUrl,categoryId}=createIssueSchema.parse(req.body)
        const issue=await createIssue(userId,orgId,{name,description,imgUrl,categoryId})
        return res.status(201).json({issue})
    } catch (error) {
        logger.error(error.message)
        return res.status(400).json({error:error.message})
    }
}
export const gettingIssues=async(req,res)=>{
    const userId=req.user?.id
    const orgId=req.params.orgId

    try {
        const issue=await getAllIssue(userId,orgId)
        return res.status(201).json({issue})
    } catch (error) {
        logger.error(error.message)
        return res.status(400).json({error:error.message})
    }
}
export const gettingIssue=async(req,res)=>{
    const userId=req.user?.id
    const orgId=req.params.orgId
    const issueId=req.params.issueId

    try {
        const issue=await getAllIssue(userId,orgId,issueId)
        return res.status(201).json({issue})
    } catch (error) {
        logger.error(error.message)
        return res.status(400).json({error:error.message})
    }
}
export const gettingAiDesc=async(req,res)=>{
    const userId=req.user?.id
    const orgId=req.params.orgId
    const image=req.file
    console.log(image);
    


    try {
        if(!image){
            const error=new Error("No image uploaded")
            error.status=400
            throw error
        }
        const issue=await getAiDesc(userId,orgId,image)

        return res.status(201).json({issue})
    } catch (error) {
        logger.error(error.message)
        return res.status(400).json({error:error.message})
    }
}