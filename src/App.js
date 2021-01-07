import { useState, useEffect } from 'react';
import fetch from 'node-fetch';

const CIRCLE_API_URL = 'https://circleci.com/api/v2';
const CIRCLE_SVG_PASSED = 'https://circleci.com/docs/assets/img/docs/svg-passed.png';
const CIRCLE_SVG_FAILED = 'https://circleci.com/docs/assets/img/docs/svg-failed.png';

// const projectSlug = 'gh/pytorch/vision';
// const workflowName = 'nightly'; // TODO: ingest from query-string

async function getWorkflowStatus(projectSlug, workflowName) {
  const pipelineRes = await fetch(new URL(`${CIRCLE_API_URL}/project/${projectSlug}/pipeline`), {
    method: 'GET',
  });
  const pipelines = await pipelineRes.json();
  const mostRecentMasterPipelineId = pipelines.items.filter(pipeline=> pipeline.vcs.branch === 'master')[0].id;
  const workflowRes = await fetch(new URL(`${CIRCLE_API_URL}/pipeline/${mostRecentMasterPipelineId}/workflow`));
  const workflows = await workflowRes.json();
  const status = workflows.items.filter(workflow => workflow.name === workflowName)[0].status;
  if (status === 'failed') {
    return CIRCLE_SVG_FAILED;
  } else {
    return CIRCLE_SVG_PASSED;
  }
}

function App() {
  const [imgSrc, setImgSrc] = useState(undefined);
  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    getWorkflowStatus(params.get('projectSlug'), params.get('workflowName')).then(setImgSrc);
  }, [])
  if (!imgSrc) {
    return 'Loading...'
  } else {
    return (
      <img src={imgSrc} />
    );
  }
}

export default App;
