import { POCProject, ActionPlanItem, Phase, PhaseTask, SuccessCriterion } from './types'

export function parseCatawikiExcel(): POCProject {
  // This data is parsed from the Catawiki Excel file
  // In a real implementation, you would read this from the actual Excel file

  const actionPlan: ActionPlanItem[] = [
    {
      id: '1',
      dueDate: new Date('2026-02-11'),
      milestone: 'Demo',
      owner: 'Rob Dillisse',
      status: 'completed'
    },
    {
      id: '2',
      dueDate: new Date('2026-02-17'),
      milestone: 'Meeting: Complete Technical Requirements Gathering',
      owner: 'Rob & Teo',
      status: 'in-progress'
    },
    {
      id: '3',
      dueDate: new Date('2026-02-17'),
      milestone: 'Confirm POC Start Date',
      owner: 'Both teams',
      status: 'in-progress'
    },
    {
      id: '4',
      dueDate: new Date('2026-02-19'),
      milestone: 'Create Collaborative Slack Channel',
      owner: 'Rob Dillisse',
      status: 'not-started'
    },
    {
      id: '5',
      dueDate: new Date('2026-02-19'),
      milestone: 'NDA completed',
      owner: 'Legal teams',
      status: 'in-progress'
    }
  ]

  const phases: Phase[] = [
    {
      id: 'phase-1',
      name: 'Phase 1: Initial Setup',
      tasks: [
        {
          id: 'p1-t1',
          task: 'Organization created',
          resources: 'Sign up link',
          owner: 'Catawiki',
          status: 'completed',
          notes: 'https://catawiki-bv.sentry.io/'
        },
        {
          id: 'p1-t2',
          task: 'Invite all participants to the POC (Slack channel + doc)',
          resources: '',
          owner: 'Rob Dillisse',
          status: 'in-progress',
          notes: ''
        },
        {
          id: 'p1-t3',
          task: 'Create a project for your applications',
          resources: 'Create a Sentry Project\nWhere to Find Your DSN',
          owner: 'Catawiki Engineering',
          status: 'in-progress',
          notes: '- Web: 1 projects already in Sentry\n- Mobile: 2 projects already in Sentry\n- BE: No projects yet'
        },
        {
          id: 'p1-t4',
          task: 'Add the Sentry SDK to your application',
          resources: 'NextJS\nAndroid\niOS\nRuby',
          owner: 'Catawiki Engineering',
          status: 'in-progress',
          notes: 'cw-buyer-ui - Make sure to upgrade the SDK version'
        },
        {
          id: 'p1-t5',
          task: 'Enable Performance Monitoring',
          resources: 'NextJS\nAndroid\niOS\nRuby',
          owner: 'Catawiki Engineering',
          status: 'in-progress',
          notes: 'For cw-buyer-ui you just need to increase the sampling rates in the code. SDK is already setup'
        },
        {
          id: 'p1-t6',
          task: 'Web Only: Enable Session Replay',
          resources: 'NextJS',
          owner: 'Catawiki Web Team',
          status: 'not-started',
          notes: ''
        }
      ]
    },
    {
      id: 'phase-2',
      name: 'Phase 2: Setting up Sentry for Success',
      tasks: [
        {
          id: 'p2-t1',
          task: 'Configure Environments',
          resources: 'NextJS\nAndroid\niOS\nRuby',
          owner: 'Catawiki Engineering',
          status: 'not-started',
          notes: ''
        },
        {
          id: 'p2-t2',
          task: 'Configure Releases - track sessions',
          resources: 'NextJS\nAndroid\niOS\nRuby',
          owner: 'Catawiki DevOps',
          status: 'not-started',
          notes: ''
        },
        {
          id: 'p2-t3',
          task: 'Upload Sourcemaps based on the release',
          resources: 'NextJS',
          owner: 'Catawiki Web Team',
          status: 'not-started',
          notes: ''
        },
        {
          id: 'p2-t4',
          task: 'Upload Debug Symbols',
          resources: 'Android\niOS',
          owner: 'Catawiki Mobile Team',
          status: 'not-started',
          notes: ''
        },
        {
          id: 'p2-t5',
          task: 'Upload Source Context',
          resources: 'Android\niOS',
          owner: 'Catawiki Mobile Team',
          status: 'not-started',
          notes: ''
        }
      ]
    },
    {
      id: 'phase-3',
      name: 'Phase 3: Full Value From Performance',
      tasks: [
        {
          id: 'p3-t1',
          task: 'Review Performance Insights',
          resources: 'Performance Dashboard',
          owner: 'Both teams',
          status: 'not-started',
          notes: 'Weekly review of performance metrics'
        }
      ]
    }
  ]

  const successCriteria: SuccessCriterion[] = [
    {
      id: 'sc-1',
      criteria: 'Engineers can identify a newly introduced production error, understand root cause, and determine the next action using a single issue view without consulting external logs or tools',
      validation: 'Trigger or observe a real production or staging error and run an end-to-end triage with an engineer using only the issue view (confirm they can explain cause and next action)',
      category: 'Error Monitoring',
      priority: 'high',
      currentState: 'Q: What is the current workflow when dealing with errors?',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-2',
      criteria: 'Errors are automatically grouped so repeated occurrences surface as a single actionable issue rather than multiple duplicates',
      validation: 'Generate/observe repeated occurrences of the same error and confirm they roll up into one issue with aggregated occurrences (no duplicate issues created)',
      category: 'Error Monitoring',
      priority: 'high',
      currentState: '',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-3',
      criteria: 'Noise is reduced so high-impact errors (by frequency or affected users) are clearly distinguishable from low-value or non-actionable events',
      validation: 'Review the issue list and confirm the highest frequency/impact errors are surfaced and clearly separated from low-impact noise (based on affected users/frequency)',
      category: 'Error Monitoring',
      priority: 'high',
      currentState: 'Q: How is performance monitored currently?',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-4',
      criteria: 'Hydration errors are automatically detected and clearly identified as server/client rendering mismatches in a Next.js application',
      validation: 'Introduce or observe a known hydration mismatch and confirm it is explicitly classified as a hydration error rather than a generic frontend exception',
      category: 'Hydration errors on Web',
      priority: 'high',
      currentState: '',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-5',
      criteria: 'Engineers can see which route, component, and render context caused the hydration mismatch',
      validation: 'Open the hydration error and verify that route, component, and render-related context are available to localize the source of the mismatch',
      category: 'Hydration errors on Web',
      priority: 'high',
      currentState: 'Q: Are there any specific alerts that you would like to test for this POC?',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-6',
      criteria: 'Engineers can determine the root cause and corrective action for a hydration error without manually reproducing the issue',
      validation: 'Review the hydration error with a frontend engineer and confirm they can explain the cause and proposed fix using only the information in the issue view',
      category: 'Hydration errors on Web',
      priority: 'high',
      currentState: '',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-7',
      criteria: 'Engineers can trace a user request end-to-end across services to understand where time is spent',
      validation: 'Trigger or observe a real user request and follow the trace across services to confirm full end-to-end visibility',
      category: 'Tracing',
      priority: 'high',
      currentState: '',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-8',
      criteria: 'Engineers can identify the specific service, endpoint, or span responsible for latency or failures',
      validation: 'Open a slow or failed trace and verify the slowest span clearly identifies the responsible service and operation',
      category: 'Tracing',
      priority: 'high',
      currentState: '',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-9',
      criteria: 'Engineers can determine whether a performance issue is caused by their own code or a downstream dependency',
      validation: 'Review the trace with an engineer and confirm they can state whether the issue originates in application code or an external dependency using trace data alone',
      category: 'Tracing',
      priority: 'high',
      currentState: '',
      status: 'not-started',
      notes: ''
    },
    {
      id: 'sc-10',
      criteria: 'Alerts surface issues automatically and assign ownership to the correct team or individual without manual triage',
      validation: 'Trigger an alert and confirm it is routed to the correct owner or team automatically, without requiring manual reassignment',
      category: 'Sentry Workflow',
      priority: 'high',
      currentState: '',
      status: 'not-started',
      notes: ''
    }
  ]

  return {
    id: 'catawiki-poc',
    customerName: 'Catawiki',
    projectName: 'FE/Mobile/Be Error & Performance monitoring',
    startDate: new Date('2026-02-11'),
    targetCompletionDate: new Date('2026-03-31'),
    sentryContact: 'Rob Dillisse',
    customerContact: 'Teo Katsimpas',
    sentryTeam: [
      { name: 'Rob Dillisse', role: 'Account Executive' },
      { name: 'Hazid Mangroe', role: 'Sales Director' },
      { name: 'Chris De Vylder', role: 'CRO' }
    ],
    customerTeam: [
      { name: 'Teo Katsimpas', role: 'Platform Lead' },
      { name: 'Stefano Baccianella', role: 'Head of Engineering' },
      { name: 'Ilya Kibardin', role: 'Senior Frontend Developer' },
      { name: 'Ahmed Fadhel Jedidi', role: 'Senior Android Developer' },
      { name: 'Manish Rathi', role: 'Backend Engineer' }
    ],
    status: 'in-progress',
    actionPlan,
    phases,
    successCriteria,
    timeline: [
      {
        id: 'cw-tl-1',
        name: 'Initial Commercial Discussion',
        category: 'commercial',
        status: 'completed',
        startDate: new Date('2026-01-20'),
        targetDate: new Date('2026-02-01'),
        completionDate: new Date('2026-01-30'),
        owner: 'Rob Dillisse',
        description: 'Initial pricing discussion and POC scope agreement',
        notes: 'Hazid joined for strategic alignment'
      },
      {
        id: 'cw-tl-2',
        name: 'Security Assessment',
        category: 'security',
        status: 'in-progress',
        startDate: new Date('2026-02-05'),
        targetDate: new Date('2026-02-28'),
        owner: 'Catawiki Security Team',
        description: 'Complete vendor security questionnaire and SOC2 review'
      },
      {
        id: 'cw-tl-3',
        name: 'IT Vendor Onboarding',
        category: 'onboarding',
        status: 'pending',
        targetDate: new Date('2026-03-10'),
        owner: 'Catawiki IT',
        description: 'Whitelist Sentry domains, configure network access',
        dependencies: ['cw-tl-2']
      },
      {
        id: 'cw-tl-4',
        name: 'GDPR DPA Review',
        category: 'legal',
        status: 'pending',
        targetDate: new Date('2026-03-15'),
        owner: 'Catawiki Legal',
        description: 'Review and sign Data Processing Agreement for EU GDPR compliance',
        notes: 'Netherlands-based, EU data residency required'
      },
      {
        id: 'cw-tl-5',
        name: 'MSA Negotiation',
        category: 'legal',
        status: 'pending',
        targetDate: new Date('2026-04-01'),
        owner: 'Rob Dillisse & Catawiki Legal',
        description: 'Negotiate Master Service Agreement terms',
        dependencies: ['cw-tl-4']
      },
      {
        id: 'cw-tl-6',
        name: 'Enterprise License Finalization',
        category: 'commercial',
        status: 'pending',
        targetDate: new Date('2026-04-15'),
        owner: 'Hazid Mangroe',
        description: 'Finalize multi-year enterprise license based on POC results',
        dependencies: ['cw-tl-5']
      }
    ],
    notes: 'High priority enterprise customer. Focus on error monitoring, performance, and hydration errors for Next.js'
  }
}
