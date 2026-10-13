import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

export default function ChecklistPage() {
  const { from, to } = useParams();
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    fetchChecklist();
  }, [from, to]);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/checklists/${from}/${to}`);
      if (response.ok) {
        const data = await response.json();
        setChecklist(data);
        // Initialize completed state
        const initialState = {};
        data.steps?.forEach(step => {
          initialState[step.id] = false;
        });
        setCompleted(initialState);
      }
    } catch (err) {
      console.error('Error fetching checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId) => {
    setCompleted(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading checklist...</div>
      </Layout>
    );
  }

  if (!checklist) {
    return (
      <Layout>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h2>Checklist Not Found</h2>
            <p>No trade checklist available for {from?.toUpperCase()} → {to?.toUpperCase()}</p>
            <p>Contact our team to add this trade route.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPercent = checklist.steps ? Math.round((completedCount / checklist.steps.length) * 100) : 0;

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#2d1f0e', marginBottom: '0.5rem' }}>
          📋 {checklist.title}
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Step-by-step guide to export from {checklist.from_country} to {checklist.to_country}
        </p>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            background: '#eee',
            borderRadius: '8px',
            height: '30px',
            overflow: 'hidden',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              background: '#4caf50',
              height: '100%',
              width: `${progressPercent}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'width 0.3s'
            }}>
              {progressPercent > 0 ? `${progressPercent}%` : ''}
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            {completedCount} of {checklist.steps?.length || 0} steps completed
          </div>
        </div>

        {/* Overview */}
        {checklist.introduction && (
          <div style={{
            background: '#f0f8ff',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            borderLeft: '4px solid #0284c7'
          }}>
            <h3 style={{ marginTop: 0 }}>Overview</h3>
            <p>{checklist.introduction}</p>
          </div>
        )}

        {/* Timeline */}
        {checklist.timeline && (
          <div style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            borderLeft: '4px solid #ff9800'
          }}>
            <h3 style={{ marginTop: 0 }}>⏱️ Timeline</h3>
            <p>{checklist.timeline}</p>
          </div>
        )}

        {/* Steps */}
        <div>
          <h3 style={{ color: '#2d1f0e', marginBottom: '1rem' }}>Steps</h3>
          {checklist.steps && checklist.steps.map((step, idx) => (
            <div
              key={step.id}
              style={{
                background: completed[step.id] ? '#f0f0f0' : '#fff',
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem',
                opacity: completed[step.id] ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'start',
                marginBottom: '1rem'
              }}>
                <input
                  type="checkbox"
                  checked={completed[step.id] || false}
                  onChange={() => toggleStep(step.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    color: '#2d1f0e',
                    textDecoration: completed[step.id] ? 'line-through' : 'none'
                  }}>
                    Step {step.step_number}: {step.title}
                  </h4>
                  <p style={{ margin: '0 0 0.75rem 0', color: '#555' }}>
                    {step.description}
                  </p>

                  {/* Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    {step.documents_needed && (
                      <div style={{
                        background: '#e8f5e9',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '0.25rem' }}>
                          📄 Documents Needed:
                        </div>
                        <div style={{ color: '#555' }}>
                          {step.documents_needed}
                        </div>
                      </div>
                    )}
                    {step.duration && (
                      <div style={{
                        background: '#fff3cd',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '0.25rem' }}>
                          ⏱️ Duration:
                        </div>
                        <div style={{ color: '#555' }}>
                          {step.duration}
                        </div>
                      </div>
                    )}
                    {step.estimated_cost && (
                      <div style={{
                        background: '#f3e5f5',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#6a1b9a', marginBottom: '0.25rem' }}>
                          💰 Cost:
                        </div>
                        <div style={{ color: '#555' }}>
                          ${step.estimated_cost}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tips */}
                  {step.tips && (
                    <div style={{
                      background: '#e3f2fd',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      marginTop: '1rem',
                      borderLeft: '4px solid #2196f3',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#1565c0', marginBottom: '0.25rem' }}>
                        💡 Pro Tip:
                      </div>
                      <div style={{ color: '#555' }}>
                        {step.tips}
                      </div>
                    </div>
                  )}

                  {/* Responsible Party */}
                  {step.responsible_party && (
                    <div style={{
                      marginTop: '1rem',
                      fontSize: '0.85rem',
                      color: '#999'
                    }}>
                      Responsible: <strong>{step.responsible_party}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {completedCount === checklist.steps?.length && completedCount > 0 && (
          <div style={{
            background: '#c8e6c9',
            color: '#1b5e20',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginTop: '2rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>✅ Checklist Complete!</h3>
            <p style={{ margin: 0 }}>
              You're ready to export from {checklist.from_country} to {checklist.to_country}. Good luck with your trade! 🚀
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
