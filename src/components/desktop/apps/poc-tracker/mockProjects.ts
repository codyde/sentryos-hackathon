import { POCProject } from './types'
import { parseCatawikiExcel } from './excelParser'

export function getAllMockProjects(): POCProject[] {
  return [
    parseCatawikiExcel(),
    getFloHealthPOC(),
    getDOJOPOC(),
    getBitvavoPOC()
  ]
}

function getFloHealthPOC(): POCProject {
  return {
    id: 'flo-health-poc',
    customerName: 'Flo Health',
    projectName: 'Mobile Error & Performance Monitoring',
    startDate: new Date('2026-02-01'),
    targetCompletionDate: new Date('2026-03-15'),
    sentryContact: 'Sarah Johnson',
    customerContact: 'Anna Kravchuk',
    sentryTeam: [
      { name: 'Sarah Johnson', role: 'Account Executive' },
      { name: 'Mike Chen', role: 'Solutions Engineer' },
      { name: 'Lisa Rodriguez', role: 'Customer Success Manager' }
    ],
    customerTeam: [
      { name: 'Anna Kravchuk', role: 'VP of Engineering' },
      { name: 'Dmitry Sokolov', role: 'Mobile Tech Lead' },
      { name: 'Maria Santos', role: 'iOS Engineer' },
      { name: 'Alex Kim', role: 'Android Engineer' }
    ],
    status: 'in-progress',
    actionPlan: [
      {
        id: 'fh-1',
        dueDate: new Date('2026-02-05'),
        milestone: 'Initial Discovery Call',
        owner: 'Sarah & Anna',
        status: 'completed'
      },
      {
        id: 'fh-2',
        dueDate: new Date('2026-02-10'),
        milestone: 'Technical Deep Dive - Mobile Architecture',
        owner: 'Mike & Dmitry',
        status: 'completed'
      },
      {
        id: 'fh-3',
        dueDate: new Date('2026-02-15'),
        milestone: 'POC Kickoff Meeting',
        owner: 'Both teams',
        status: 'in-progress'
      },
      {
        id: 'fh-4',
        dueDate: new Date('2026-02-28'),
        milestone: 'Mid-POC Check-in',
        owner: 'Sarah & Lisa',
        status: 'not-started'
      },
      {
        id: 'fh-5',
        dueDate: new Date('2026-03-15'),
        milestone: 'Final Review & Business Case',
        owner: 'Anna & Sarah',
        status: 'not-started'
      }
    ],
    phases: [
      {
        id: 'fh-phase-1',
        name: 'Phase 1: Mobile SDK Integration',
        tasks: [
          {
            id: 'fh-p1-t1',
            task: 'Create Sentry organization and projects',
            resources: 'Sentry Signup',
            owner: 'Flo Health',
            status: 'completed',
            notes: 'Org: flo-health, Projects: flo-ios, flo-android'
          },
          {
            id: 'fh-p1-t2',
            task: 'Install Sentry SDK in iOS app',
            resources: 'iOS SDK Docs',
            owner: 'Maria Santos',
            targetDate: new Date('2026-02-12'),
            status: 'completed',
            notes: 'Using @sentry/react-native'
          },
          {
            id: 'fh-p1-t3',
            task: 'Install Sentry SDK in Android app',
            resources: 'Android SDK Docs',
            owner: 'Alex Kim',
            targetDate: new Date('2026-02-12'),
            status: 'in-progress',
            notes: ''
          },
          {
            id: 'fh-p1-t4',
            task: 'Configure error tracking for production',
            resources: 'Error Tracking Guide',
            owner: 'Dmitry Sokolov',
            targetDate: new Date('2026-02-18'),
            status: 'not-started',
            notes: ''
          },
          {
            id: 'fh-p1-t5',
            task: 'Enable Performance Monitoring',
            resources: 'Performance Docs',
            owner: 'Mobile Team',
            targetDate: new Date('2026-02-20'),
            status: 'not-started',
            notes: 'Track app launch, screen loads, network requests'
          }
        ]
      },
      {
        id: 'fh-phase-2',
        name: 'Phase 2: Advanced Configuration',
        tasks: [
          {
            id: 'fh-p2-t1',
            task: 'Configure release tracking',
            resources: 'Release Docs',
            owner: 'DevOps Team',
            targetDate: new Date('2026-02-25'),
            status: 'not-started',
            notes: 'Integrate with CI/CD pipeline'
          },
          {
            id: 'fh-p2-t2',
            task: 'Upload debug symbols (iOS dSYMs)',
            resources: 'iOS Symbols',
            owner: 'Maria Santos',
            targetDate: new Date('2026-02-27'),
            status: 'not-started',
            notes: ''
          },
          {
            id: 'fh-p2-t3',
            task: 'Upload ProGuard mapping files (Android)',
            resources: 'Android Symbols',
            owner: 'Alex Kim',
            targetDate: new Date('2026-02-27'),
            status: 'not-started',
            notes: ''
          },
          {
            id: 'fh-p2-t4',
            task: 'Set up user feedback collection',
            resources: 'User Feedback',
            owner: 'Mobile Team',
            targetDate: new Date('2026-03-01'),
            status: 'not-started',
            notes: 'Allow users to report issues'
          }
        ]
      },
      {
        id: 'fh-phase-3',
        name: 'Phase 3: Alerting & Integration',
        tasks: [
          {
            id: 'fh-p3-t1',
            task: 'Configure Slack alerts for critical errors',
            resources: 'Slack Integration',
            owner: 'Dmitry Sokolov',
            targetDate: new Date('2026-03-05'),
            status: 'not-started',
            notes: ''
          },
          {
            id: 'fh-p3-t2',
            task: 'Set up metric alerts for crash rate',
            resources: 'Metric Alerts',
            owner: 'Mobile Team',
            targetDate: new Date('2026-03-10'),
            status: 'not-started',
            notes: 'Alert if crash rate > 1%'
          }
        ]
      }
    ],
    successCriteria: [
      {
        id: 'fh-sc-1',
        criteria: 'Mobile engineers can identify and fix crash-causing errors within 24 hours using only Sentry',
        validation: 'Trigger a crash in production, measure time to resolution using only Sentry data',
        category: 'Mobile Error Monitoring',
        priority: 'high',
        currentState: 'Currently using Crashlytics',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'fh-sc-2',
        criteria: 'Performance regressions are automatically detected before users report them',
        validation: 'Introduce a slow screen load and verify metric alert fires',
        category: 'Mobile Performance',
        priority: 'high',
        currentState: '',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'fh-sc-3',
        criteria: 'Crash-free sessions rate is visible and tracked across releases',
        validation: 'Deploy new release and verify crash-free rate is calculated correctly',
        category: 'Release Health',
        priority: 'medium',
        currentState: '',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'fh-sc-4',
        criteria: 'Critical errors automatically notify the on-call engineer via Slack',
        validation: 'Trigger a critical error and verify Slack notification within 5 minutes',
        category: 'Alerting',
        priority: 'high',
        currentState: '',
        status: 'not-started',
        notes: ''
      }
    ],
    timeline: [
      {
        id: 'fh-tl-1',
        name: 'Initial Commercial Discussion',
        category: 'commercial',
        status: 'completed',
        startDate: new Date('2026-01-15'),
        targetDate: new Date('2026-01-20'),
        completionDate: new Date('2026-01-18'),
        owner: 'Sarah Johnson',
        description: 'Pricing discussion and POC terms agreed',
        notes: 'Budget approved by Anna'
      },
      {
        id: 'fh-tl-2',
        name: 'Security Questionnaire',
        category: 'security',
        status: 'in-progress',
        startDate: new Date('2026-02-01'),
        targetDate: new Date('2026-02-20'),
        owner: 'Flo Security Team',
        description: 'Complete vendor security assessment and compliance review'
      },
      {
        id: 'fh-tl-3',
        name: 'IT Security Vendor Onboarding',
        category: 'security',
        status: 'pending',
        targetDate: new Date('2026-02-25'),
        owner: 'Flo IT Security',
        description: 'Whitelist Sentry domains, approve data processing agreement',
        dependencies: ['fh-tl-2']
      },
      {
        id: 'fh-tl-4',
        name: 'MSA Negotiation',
        category: 'legal',
        status: 'pending',
        targetDate: new Date('2026-03-01'),
        owner: 'Flo Legal & Sentry Legal',
        description: 'Master Service Agreement review and negotiation',
        notes: 'Waiting on POC results before starting'
      },
      {
        id: 'fh-tl-5',
        name: 'Enterprise License Discussion',
        category: 'commercial',
        status: 'pending',
        targetDate: new Date('2026-03-20'),
        owner: 'Sarah Johnson',
        description: 'Finalize pricing for production rollout based on POC success',
        dependencies: ['fh-tl-4']
      }
    ],
    notes: 'Focus on mobile-first monitoring. High user volume (100M+ users).'
  }
}

function getDOJOPOC(): POCProject {
  return {
    id: 'dojo-poc',
    customerName: 'DOJO',
    projectName: 'Payment Processing Error Monitoring',
    startDate: new Date('2026-01-20'),
    targetCompletionDate: new Date('2026-03-01'),
    sentryContact: 'Tom Anderson',
    customerContact: 'James Williams',
    sentryTeam: [
      { name: 'Tom Anderson', role: 'Account Executive' },
      { name: 'Rachel Green', role: 'Solutions Engineer' },
      { name: 'David Park', role: 'Customer Success Manager' }
    ],
    customerTeam: [
      { name: 'James Williams', role: 'CTO' },
      { name: 'Sophie Chen', role: 'Backend Lead' },
      { name: 'Oliver Brown', role: 'DevOps Engineer' },
      { name: 'Emma Davis', role: 'Senior Backend Engineer' }
    ],
    status: 'in-progress',
    actionPlan: [
      {
        id: 'dj-1',
        dueDate: new Date('2026-01-22'),
        milestone: 'Executive Alignment Call',
        owner: 'Tom & James',
        status: 'completed'
      },
      {
        id: 'dj-2',
        dueDate: new Date('2026-01-28'),
        milestone: 'Technical Requirements Workshop',
        owner: 'Rachel & Sophie',
        status: 'completed'
      },
      {
        id: 'dj-3',
        dueDate: new Date('2026-02-05'),
        milestone: 'Security & Compliance Review',
        owner: 'Both teams',
        status: 'completed'
      },
      {
        id: 'dj-4',
        dueDate: new Date('2026-02-20'),
        milestone: 'POC Progress Review',
        owner: 'Tom & David',
        status: 'in-progress'
      },
      {
        id: 'dj-5',
        dueDate: new Date('2026-03-01'),
        milestone: 'Final Decision & Contract Negotiation',
        owner: 'James & Tom',
        status: 'not-started'
      }
    ],
    phases: [
      {
        id: 'dj-phase-1',
        name: 'Phase 1: Backend Integration',
        tasks: [
          {
            id: 'dj-p1-t1',
            task: 'Setup Sentry organization',
            resources: '',
            owner: 'DOJO DevOps',
            status: 'completed',
            notes: 'Org: dojo-payments'
          },
          {
            id: 'dj-p1-t2',
            task: 'Install Sentry in Node.js payment service',
            resources: 'Node.js Docs',
            owner: 'Emma Davis',
            targetDate: new Date('2026-02-10'),
            status: 'completed',
            notes: 'Using @sentry/node v8.x'
          },
          {
            id: 'dj-p1-t3',
            task: 'Configure transaction tracing for payment flows',
            resources: 'Tracing Docs',
            owner: 'Sophie Chen',
            targetDate: new Date('2026-02-15'),
            status: 'in-progress',
            notes: 'Trace: card validation, payment processing, settlement'
          },
          {
            id: 'dj-p1-t4',
            task: 'Add custom context for payment metadata',
            resources: 'Context Docs',
            owner: 'Emma Davis',
            targetDate: new Date('2026-02-18'),
            status: 'in-progress',
            notes: 'Include merchant ID, transaction ID, payment method'
          }
        ]
      },
      {
        id: 'dj-phase-2',
        name: 'Phase 2: Advanced Monitoring',
        tasks: [
          {
            id: 'dj-p2-t1',
            task: 'Configure PII scrubbing for card data',
            resources: 'Data Scrubbing',
            owner: 'Oliver Brown',
            targetDate: new Date('2026-02-20'),
            status: 'not-started',
            notes: 'Critical: PCI compliance requirement'
          },
          {
            id: 'dj-p2-t2',
            task: 'Set up distributed tracing across microservices',
            resources: 'Distributed Tracing',
            owner: 'Sophie Chen',
            targetDate: new Date('2026-02-25'),
            status: 'not-started',
            notes: 'Payment API → Auth Service → Settlement Service'
          },
          {
            id: 'dj-p2-t3',
            task: 'Implement custom metrics for payment success rate',
            resources: 'Custom Metrics',
            owner: 'Emma Davis',
            targetDate: new Date('2026-02-27'),
            status: 'not-started',
            notes: 'Track by payment method and merchant'
          }
        ]
      }
    ],
    successCriteria: [
      {
        id: 'dj-sc-1',
        criteria: 'Payment processing errors are detected and resolved before affecting SLA',
        validation: 'Monitor error rate during peak hours, verify under threshold',
        category: 'Error Detection',
        priority: 'high',
        currentState: 'Currently using ELK stack',
        status: 'in-progress',
        notes: ''
      },
      {
        id: 'dj-sc-2',
        criteria: 'All PII and sensitive card data is automatically scrubbed from error reports',
        validation: 'Trigger error with test card data, verify no PII in Sentry',
        category: 'Security & Compliance',
        priority: 'high',
        currentState: '',
        status: 'not-started',
        notes: 'Must pass before production'
      },
      {
        id: 'dj-sc-3',
        criteria: 'Payment transaction flows are traceable end-to-end across all microservices',
        validation: 'Generate test transaction, verify complete trace in Sentry',
        category: 'Distributed Tracing',
        priority: 'high',
        currentState: '',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'dj-sc-4',
        criteria: 'Failed payment alerts are sent to on-call engineer within 2 minutes',
        validation: 'Simulate payment service failure, measure alert delivery time',
        category: 'Alerting',
        priority: 'medium',
        currentState: '',
        status: 'not-started',
        notes: ''
      }
    ],
    timeline: [
      {
        id: 'dj-tl-1',
        name: 'PCI Compliance Review',
        category: 'security',
        status: 'completed',
        startDate: new Date('2026-01-05'),
        targetDate: new Date('2026-01-25'),
        completionDate: new Date('2026-01-22'),
        owner: 'DOJO Security Team',
        description: 'Review Sentry\'s PCI DSS compliance documentation and data handling practices'
      },
      {
        id: 'dj-tl-2',
        name: 'DPA & BAA Execution',
        category: 'legal',
        status: 'completed',
        startDate: new Date('2026-01-20'),
        targetDate: new Date('2026-02-05'),
        completionDate: new Date('2026-02-03'),
        owner: 'DOJO Legal',
        description: 'Sign Data Processing Agreement and Business Associate Agreement',
        notes: 'Required for handling payment data'
      },
      {
        id: 'dj-tl-3',
        name: 'Security Vendor Onboarding',
        category: 'security',
        status: 'in-progress',
        startDate: new Date('2026-02-05'),
        targetDate: new Date('2026-02-20'),
        owner: 'DOJO InfoSec',
        description: 'Complete vendor security assessment, penetration test review',
        notes: 'Awaiting final sign-off from CISO'
      },
      {
        id: 'dj-tl-4',
        name: 'MSA Negotiation',
        category: 'legal',
        status: 'in-progress',
        startDate: new Date('2026-02-01'),
        targetDate: new Date('2026-03-01'),
        owner: 'Tom Anderson & DOJO Legal',
        description: 'Negotiate terms for Master Service Agreement',
        notes: 'Discussing liability caps and SLA commitments'
      },
      {
        id: 'dj-tl-5',
        name: 'Enterprise Pricing Finalization',
        category: 'commercial',
        status: 'pending',
        targetDate: new Date('2026-03-15'),
        owner: 'Tom Anderson',
        description: 'Finalize volume-based pricing for production deployment',
        dependencies: ['dj-tl-4']
      },
      {
        id: 'dj-tl-6',
        name: 'Production Environment Setup',
        category: 'technical',
        status: 'pending',
        targetDate: new Date('2026-03-20'),
        owner: 'DOJO DevOps',
        description: 'Configure production Sentry organization, set up SSO',
        dependencies: ['dj-tl-3', 'dj-tl-4']
      }
    ],
    notes: 'Critical focus on PCI compliance and data privacy. Payment processing SLA: 99.95%'
  }
}

function getBitvavoPOC(): POCProject {
  return {
    id: 'bitvavo-poc',
    customerName: 'Bitvavo',
    projectName: 'High-Volume Trading Platform Monitoring',
    startDate: new Date('2026-02-15'),
    targetCompletionDate: new Date('2026-04-15'),
    sentryContact: 'Laura Martinez',
    customerContact: 'Mark de Vries',
    sentryTeam: [
      { name: 'Laura Martinez', role: 'Enterprise Account Executive' },
      { name: 'Kevin Zhang', role: 'Solutions Architect' },
      { name: 'Nina Patel', role: 'Technical Account Manager' }
    ],
    customerTeam: [
      { name: 'Mark de Vries', role: 'VP of Engineering' },
      { name: 'Lisa van Dam', role: 'Platform Lead' },
      { name: 'Jan Bakker', role: 'Trading Engine Lead' },
      { name: 'Sophie Jansen', role: 'Frontend Lead' }
    ],
    status: 'not-started',
    actionPlan: [
      {
        id: 'bv-1',
        dueDate: new Date('2026-02-18'),
        milestone: 'Initial Partnership Discussion',
        owner: 'Laura & Mark',
        status: 'not-started'
      },
      {
        id: 'bv-2',
        dueDate: new Date('2026-02-25'),
        milestone: 'Technical Architecture Review',
        owner: 'Kevin & Lisa',
        status: 'not-started'
      },
      {
        id: 'bv-3',
        dueDate: new Date('2026-03-05'),
        milestone: 'POC Scope Finalization',
        owner: 'Both teams',
        status: 'not-started'
      },
      {
        id: 'bv-4',
        dueDate: new Date('2026-03-20'),
        milestone: 'Mid-POC Technical Review',
        owner: 'Kevin & Jan',
        status: 'not-started'
      },
      {
        id: 'bv-5',
        dueDate: new Date('2026-04-10'),
        milestone: 'Load Testing & Performance Validation',
        owner: 'Platform Team',
        status: 'not-started'
      },
      {
        id: 'bv-6',
        dueDate: new Date('2026-04-15'),
        milestone: 'Executive Review & Decision',
        owner: 'Mark & Laura',
        status: 'not-started'
      }
    ],
    phases: [
      {
        id: 'bv-phase-1',
        name: 'Phase 1: Core Platform Setup',
        tasks: [
          {
            id: 'bv-p1-t1',
            task: 'Create enterprise Sentry organization',
            resources: 'Enterprise Setup',
            owner: 'Bitvavo DevOps',
            targetDate: new Date('2026-03-01'),
            status: 'not-started',
            notes: 'Requires SSO and IP whitelisting'
          },
          {
            id: 'bv-p1-t2',
            task: 'Integrate Sentry in trading engine (Python)',
            resources: 'Python SDK',
            owner: 'Jan Bakker',
            targetDate: new Date('2026-03-10'),
            status: 'not-started',
            notes: 'Critical: high-throughput system'
          },
          {
            id: 'bv-p1-t3',
            task: 'Integrate Sentry in web platform (React)',
            resources: 'React SDK',
            owner: 'Sophie Jansen',
            targetDate: new Date('2026-03-10'),
            status: 'not-started',
            notes: ''
          },
          {
            id: 'bv-p1-t4',
            task: 'Configure performance monitoring with sampling',
            resources: 'Performance Docs',
            owner: 'Lisa van Dam',
            targetDate: new Date('2026-03-15'),
            status: 'not-started',
            notes: 'Start with 5% sampling rate'
          }
        ]
      },
      {
        id: 'bv-phase-2',
        name: 'Phase 2: High-Volume Optimization',
        tasks: [
          {
            id: 'bv-p2-t1',
            task: 'Configure rate limiting and quotas',
            resources: 'Rate Limiting',
            owner: 'Kevin Zhang',
            targetDate: new Date('2026-03-20'),
            status: 'not-started',
            notes: 'Handle 100K+ transactions per second'
          },
          {
            id: 'bv-p2-t2',
            task: 'Set up custom fingerprinting for trading errors',
            resources: 'Grouping',
            owner: 'Jan Bakker',
            targetDate: new Date('2026-03-25'),
            status: 'not-started',
            notes: 'Group by error type and trading pair'
          },
          {
            id: 'bv-p2-t3',
            task: 'Implement distributed tracing for order flow',
            resources: 'Tracing',
            owner: 'Platform Team',
            targetDate: new Date('2026-03-30'),
            status: 'not-started',
            notes: 'Order placement → Validation → Execution → Settlement'
          },
          {
            id: 'bv-p2-t4',
            task: 'Configure metric alerts for abnormal trading patterns',
            resources: 'Metric Alerts',
            owner: 'Jan Bakker',
            targetDate: new Date('2026-04-05'),
            status: 'not-started',
            notes: 'Alert on order failure rate, latency spikes'
          }
        ]
      }
    ],
    successCriteria: [
      {
        id: 'bv-sc-1',
        criteria: 'Sentry handles peak trading volume (100K+ events/sec) without performance degradation',
        validation: 'Load test during simulated trading spike, measure system impact',
        category: 'Scalability',
        priority: 'high',
        currentState: 'Need to validate at scale',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'bv-sc-2',
        criteria: 'Trading errors are detected and grouped accurately without creating noise',
        validation: 'Generate various error types, verify logical grouping',
        category: 'Error Management',
        priority: 'high',
        currentState: '',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'bv-sc-3',
        criteria: 'Critical trading issues trigger immediate alerts to the incident team',
        validation: 'Simulate critical failure, verify alert within 1 minute',
        category: 'Alerting',
        priority: 'high',
        currentState: '',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'bv-sc-4',
        criteria: 'Complete transaction traces are available for failed orders',
        validation: 'Generate failed order, verify end-to-end trace in Sentry',
        category: 'Observability',
        priority: 'medium',
        currentState: '',
        status: 'not-started',
        notes: ''
      },
      {
        id: 'bv-sc-5',
        criteria: 'Frontend performance issues are detected before users report them',
        validation: 'Introduce slow render, verify automatic detection and alert',
        category: 'Frontend Monitoring',
        priority: 'medium',
        currentState: '',
        status: 'not-started',
        notes: ''
      }
    ],
    timeline: [
      {
        id: 'bv-tl-1',
        name: 'Enterprise RFP Response',
        category: 'commercial',
        status: 'completed',
        startDate: new Date('2026-01-10'),
        targetDate: new Date('2026-01-30'),
        completionDate: new Date('2026-01-28'),
        owner: 'Laura Martinez',
        description: 'Respond to Request for Proposal with technical and commercial details'
      },
      {
        id: 'bv-tl-2',
        name: 'Financial Services Compliance Review',
        category: 'security',
        status: 'in-progress',
        startDate: new Date('2026-02-01'),
        targetDate: new Date('2026-03-01'),
        owner: 'Bitvavo Compliance Team',
        description: 'Review Sentry compliance with EU financial regulations (MiFID II, PSD2)',
        notes: 'AFM requirements for Dutch financial institutions'
      },
      {
        id: 'bv-tl-3',
        name: 'Security Audit Review',
        category: 'security',
        status: 'pending',
        targetDate: new Date('2026-03-10'),
        owner: 'Bitvavo CISO',
        description: 'Review Sentry SOC2, ISO27001, and penetration test results',
        dependencies: ['bv-tl-2']
      },
      {
        id: 'bv-tl-4',
        name: 'GDPR Data Processing Agreement',
        category: 'legal',
        status: 'pending',
        targetDate: new Date('2026-03-15'),
        owner: 'Bitvavo Legal',
        description: 'Negotiate and sign EU GDPR-compliant Data Processing Agreement',
        notes: 'Dutch law jurisdiction required'
      },
      {
        id: 'bv-tl-5',
        name: 'Enterprise MSA Negotiation',
        category: 'legal',
        status: 'pending',
        targetDate: new Date('2026-04-01'),
        owner: 'Laura Martinez & Bitvavo Legal',
        description: 'Negotiate multi-year Master Service Agreement',
        dependencies: ['bv-tl-4']
      },
      {
        id: 'bv-tl-6',
        name: 'Volume-Based Pricing Agreement',
        category: 'commercial',
        status: 'pending',
        targetDate: new Date('2026-04-10'),
        owner: 'Laura Martinez',
        description: 'Finalize enterprise pricing for 100M+ events/month',
        dependencies: ['bv-tl-5']
      },
      {
        id: 'bv-tl-7',
        name: 'Production Infrastructure Setup',
        category: 'technical',
        status: 'pending',
        targetDate: new Date('2026-04-20'),
        owner: 'Bitvavo DevOps',
        description: 'Set up dedicated Sentry organization with SSO and IP whitelisting',
        dependencies: ['bv-tl-3', 'bv-tl-5']
      }
    ],
    notes: 'Enterprise deal. Focus on high-volume, low-latency requirements. Peak: 100K+ tx/sec'
  }
}
