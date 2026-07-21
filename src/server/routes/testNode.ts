import express from 'express';
import { ProjectRequest } from '../middleware/resolveProject.js';
import { assembleContext } from '../services/contextAssembler.js';
import { generateCall, brainstormCall, questionCall, departmentCall } from '../services/geminiService.js';

const router = express.Router({ mergeParams: true });

router.post('/', async (req: ProjectRequest, res, next) => {
  try {
    const { targetNodeId, graph, callType, department } = req.body;
    const { projectId } = req.params;

    if (!targetNodeId || !graph || !callType) {
      return res.status(400).json({ error: 'targetNodeId, graph, and callType are required' });
    }

    // Assemble the prompts using the context assembler
    const { systemPrompt, userPrompt } = await assembleContext(
      targetNodeId,
      callType === 'brainstorm' ? 'generate' : callType,
      department || null,
      graph,
      projectId
    );

    // Call the matching Gemini API service
    let responseData: any = null;
    try {
      if (callType === 'generate') {
        responseData = await generateCall(targetNodeId, graph, projectId);
      } else if (callType === 'brainstorm') {
        responseData = await brainstormCall(targetNodeId, graph, projectId);
      } else if (callType === 'question') {
        responseData = await questionCall(targetNodeId, graph, projectId);
      } else if (callType === 'department') {
        if (!department) {
          return res.status(400).json({ error: 'department is required for department pass' });
        }
        responseData = await departmentCall(targetNodeId, department, graph, projectId);
      }
    } catch (aiErr: any) {
      responseData = `AI Execution Error: ${aiErr.message}`;
    }

    res.json({
      systemPrompt,
      userPrompt,
      response: responseData
    });
  } catch (err) {
    next(err);
  }
});

export default router;
