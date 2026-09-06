import React, { useState } from 'react';
import {
  VscSend,
  VscAdd,
  VscTrash,
  VscSave,
  VscHistory,
  VscCopy,
  VscCheck,
  VscWarning,
  VscJson,
  VscCode
} from 'react-icons/vsc';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#4ec9b0',
  POST: '#dcdcaa',
  PUT: '#569cd6',
  DELETE: '#f44747',
  PATCH: '#c586c0',
  HEAD: '#808080',
  OPTIONS: '#808080',
};

export const ApiTester: React.FC = () => {
  const [requests, setRequests] = useState<ApiRequest[]>([
    {
      id: '1',
      name: 'New Request',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    },
  ]);
  const [activeRequestId, setActiveRequestId] = useState('1');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'response'>('headers');
  const [history, setHistory] = useState<Array<{ request: ApiRequest; response: ApiResponse }>>([]);

  const activeRequest = requests.find(r => r.id === activeRequestId);

  const updateRequest = (updates: Partial<ApiRequest>) => {
    setRequests(requests.map(r =>
      r.id === activeRequestId ? { ...r, ...updates } : r
    ));
  };

  const addRequest = () => {
    const newRequest: ApiRequest = {
      id: Date.now().toString(),
      name: `Request ${requests.length + 1}`,
      method: 'GET',
      url: '',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    };
    setRequests([...requests, newRequest]);
    setActiveRequestId(newRequest.id);
  };

  const deleteRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    if (activeRequestId === id) {
      setActiveRequestId(requests[0]?.id || '');
    }
  };

  const sendRequest = async () => {
    if (!activeRequest || !activeRequest.url) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method: activeRequest.method,
        headers: activeRequest.headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(activeRequest.method) && activeRequest.body) {
        options.body = activeRequest.body;
      }

      const res = await fetch(activeRequest.url, options);
      const endTime = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const body = await res.text();
      const size = new Blob([body]).size;

      const apiResponse: ApiResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body,
        time: endTime - startTime,
        size,
      };

      setResponse(apiResponse);
      setHistory([{ request: activeRequest, response: apiResponse }, ...history.slice(0, 19)]);
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: error.message,
        time: Date.now() - startTime,
        size: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatJson = (str: string) => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!activeRequest) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
      }}>
        <VscSend size={48} />
        <div style={{ marginTop: '16px' }}>Create a new request to get started</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Sidebar - Request List */}
      <div style={{
        width: '200px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <VscSend size={16} color="var(--accent-color)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            API Client
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={addRequest} style={toolBtnStyle} title="New Request">
            <VscAdd size={14} />
          </button>
        </div>

        {/* Request List */}
        <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
          {requests.map(request => (
            <div
              key={request.id}
              onClick={() => setActiveRequestId(request.id)}
              style={{
                padding: '12px',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                backgroundColor: activeRequestId === request.id ? 'var(--bg-tertiary)' : 'transparent',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  padding: '2px 6px',
                  backgroundColor: METHOD_COLORS[request.method],
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  {request.method}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {request.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRequest(request.id);
                  }}
                  style={{
                    padding: '2px 4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <VscTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)' }}>
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <VscHistory size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>History</span>
            </div>
            <div style={{ maxHeight: '150px', overflow: 'auto' }} className="scrollbar">
              {history.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    updateRequest({
                      method: item.request.method,
                      url: item.request.url,
                      headers: item.request.headers,
                      body: item.request.body,
                    });
                    setResponse(item.response);
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{
                      color: item.response.status >= 200 && item.response.status < 300 ? '#4ec9b0' : '#f44747',
                    }}>
                      {item.response.status}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.request.method}</span>
                  </div>
                  <div style={{
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.request.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* URL Bar */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px',
        }}>
          <select
            value={activeRequest.method}
            onChange={(e) => updateRequest({ method: e.target.value as HttpMethod })}
            style={{
              padding: '8px 12px',
              backgroundColor: METHOD_COLORS[activeRequest.method],
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {HTTP_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <input
            type="text"
            value={activeRequest.url}
            onChange={(e) => updateRequest({ url: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
            placeholder="Enter request URL"
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />

          <button
            onClick={sendRequest}
            disabled={loading || !activeRequest.url}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? 'var(--bg-tertiary)' : 'var(--accent-color)',
              color: loading ? 'var(--text-secondary)' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !activeRequest.url ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            <VscSend size={14} />
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Request/Response Tabs */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Tab Headers */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
          }}>
            {['headers', 'body', 'response'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : '2px solid transparent',
                  backgroundColor: activeTab === tab ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'headers' && (
              <div style={{ padding: '12px 16px', overflow: 'auto', height: '100%' }} className="scrollbar">
                {Object.entries(activeRequest.headers).map(([key, value], index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newHeaders = { ...activeRequest.headers };
                        delete newHeaders[key];
                        newHeaders[e.target.value] = value;
                        updateRequest({ headers: newHeaders });
                      }}
                      placeholder="Header name"
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        updateRequest({
                          headers: { ...activeRequest.headers, [key]: e.target.value },
                        });
                      }}
                      placeholder="Value"
                      style={{
                        flex: 2,
                        padding: '6px 8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => {
                        const newHeaders = { ...activeRequest.headers };
                        delete newHeaders[key];
                        updateRequest({ headers: newHeaders });
                      }}
                      style={toolBtnStyle}
                    >
                      <VscTrash size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    updateRequest({
                      headers: { ...activeRequest.headers, '': '' },
                    });
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Add Header
                </button>
              </div>
            )}

            {activeTab === 'body' && (
              <textarea
                value={activeRequest.body}
                onChange={(e) => updateRequest({ body: e.target.value })}
                placeholder="Request body (JSON, form data, etc.)"
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  fontFamily: "'Consolas', 'Monaco', monospace",
                  fontSize: '13px',
                  lineHeight: '1.5',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                spellCheck={false}
              />
            )}

            {activeTab === 'response' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {response ? (
                  <>
                    {/* Response Status */}
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: response.status >= 200 && response.status < 300 ? '#4ec9b0' : '#f44747',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                      }}>
                        {response.status} {response.statusText}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Time: {response.time}ms
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Size: {formatSize(response.size)}
                      </span>
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={() => copyToClipboard(response.body)}
                        style={toolBtnStyle}
                        title="Copy Response"
                      >
                        <VscCopy size={14} />
                      </button>
                      <button
                        onClick={() => copyToClipboard(formatJson(response.body))}
                        style={toolBtnStyle}
                        title="Format JSON"
                      >
                        <VscJson size={14} />
                      </button>
                    </div>

                    {/* Response Body */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '12px' }} className="scrollbar">
                      <pre style={{
                        margin: 0,
                        fontFamily: "'Consolas', 'Monaco', monospace",
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}>
                        {formatJson(response.body)}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    <VscSend size={48} />
                    <div style={{ marginTop: '16px' }}>Send a request to see the response</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const toolBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  borderRadius: '4px',
};
