import { useMemo, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { addDocument } from '../../data/UploadPage';

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    visibility: 'public',
    tags: '',
    description: '',
  });
  
  const fileSize = useMemo(() => {
    if (!selectedFile) return '';
    const sizeInMb = selectedFile.size / (1024 * 1024); //Byte to MB
    return `${sizeInMb.toFixed(sizeInMb >= 1 ? 1 : 2)} MB`; 
    //Nếu >=1 MB thì lấy 1 chữ số thập phân, còn < 1MB thì lấy 2 chữ số thập phân 
  }, [selectedFile]); 

  //Thay đổi/Ghi nội dung thông tin của file upload lên trang web
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    //current là data hiện tại đang nhập
  };


  const handleVisibilityToggle = (event) => {
    setFormData((current) => ({
      ...current,
      visibility: event.target.checked ? 'public' : 'private',
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]; 
    //Dấu "?." tránh lỗi khi không có file
    //[0] là lấy file đầu trong list file user chọn, app hiện tại chỉ cho up 1 file
    if (!file) return;

    setSelectedFile(file);
    setFormData((current) => ({
      ...current,
      title: current.title || file.name.replace(/\.[^/.]+$/, ''),
    }));
    //Ô title đang trống thì lấy luôn tên file làm title
    //file.name.replace(/\.[^/.]+$/, '') sẽ loại bỏ đuôi file (như .pdf, .docs., .docx, ...)
  };

  //Chỉ xóa file đang chọn
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  //Xóa toàn bộ nd và file đang chọn
  const handleClear = () => {
    setSelectedFile(null);
    setFormData({
      title: '',
      visibility: 'public',
      tags: '',
      description: '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error('Please choose a document to upload.');
      return;
    } 

    if (!formData.title.trim()) {
      toast.error('Please fill in the title.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addDocument({
        title: formData.title.trim(),
        visibility: formData.visibility,
        tags: formData.tags,
        description: formData.description,
        fileName: selectedFile.name,
        size: fileSize,
        sizeInBytes: selectedFile.size,
        date: new Date().toISOString(),
        status: formData.visibility === 'private' ? 'PRIVATE' : 'PENDING',
      });

      toast.success('Document uploaded successfully.');
      handleClear();
      navigate('/my-documents');
    } catch (error) {
      toast.error(error.message || 'Could not upload document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="d-flex align-items-center gap-2 mb-4">
            <div
              className="rounded"
              style={{ width: '4px', height: '28px', background: 'linear-gradient(to bottom, #C73866, #FD8F52)' }}
            />
            <div>
              <h4 className="mb-1 fw-bold text-dark">Upload Document</h4>
              <p className="mb-0 text-muted">Share your study materials with the StudyDocs AI community.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
            <div className="card-body p-4 p-md-5">
              <div className="row g-4">
                <div className="col-12 col-lg-5">
                  <label
                    htmlFor="document-file"
                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4 bg-light border border-2 border-dashed"
                    style={{ minHeight: '320px', borderRadius: '1rem', borderColor: 'rgba(253, 143, 82, 0.35)' }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #C73866, #FD8F52)' }}
                    >
                      <Upload className="text-white" size={32} />
                    </div>
                    <h5 className="fw-bold text-dark mb-2">Choose a document</h5>
                    <p className="text-muted mb-3" style={{ maxWidth: '280px' }}>
                      PDF, DOC, DOCX, PPT, PPTX files are supported.
                    </p>
                    <span className="btn text-white border-0 px-4" style={{ background: 'linear-gradient(135deg, #C73866, #FD8F52)', borderRadius: '20px' }}>
                      Browse File
                    </span>
                    <input
                      id="document-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      className="d-none"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <div className="col-12 col-lg-7">
                  {selectedFile && (
                    <div className="d-flex align-items-center justify-content-between gap-3 bg-light border rounded-3 p-3 mb-4">
                      <div className="d-flex align-items-center gap-3 overflow-hidden">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '46px', height: '46px', backgroundColor: '#FFF5ED', color: '#FD8F52' }}
                        >
                          <FileText size={24} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="fw-semibold text-dark mb-0 text-truncate">{selectedFile.name}</p>
                          <small className="text-muted">{fileSize}</small>
                        </div>
                      </div>
                      <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={handleRemoveFile} aria-label="Remove file">
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark" htmlFor="title">Title</label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        className="form-control"
                        placeholder="Enter document title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark" htmlFor="tags">Tags</label>
                      <input
                        id="tags"
                        name="tags"
                        type="text"
                        className="form-control"
                        placeholder="ai, lecture notes, final exam"
                        value={formData.tags}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark" htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        rows="4"
                        placeholder="Add a short summary for this document"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label
                        htmlFor="visibility"
                        className="d-flex align-items-center justify-content-between gap-3 bg-light p-3 mb-0"
                        style={{ borderRadius: '10px', cursor: 'pointer' }}
                      >
                        <div>
                          <p className="fw-bold text-dark mb-1">Make this document public</p>
                          <p className="text-muted mb-0">Public documents will be reviewed by admins before appearing in search</p>
                        </div>
                        <div className="form-check form-switch m-0 flex-shrink-0">
                          <input
                            id="visibility"
                            name="visibility"
                            type="checkbox"
                            className="form-check-input"
                            role="switch"
                            checked={formData.visibility === 'public'}
                            onChange={handleVisibilityToggle}
                            style={{
                              width: '40px',
                              height: '22px',
                              cursor: 'pointer',
                              backgroundColor: formData.visibility === 'public' ? '#FDB36B' : undefined,
                              borderColor: formData.visibility === 'public' ? '#FDB36B' : undefined,
                            }}
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="reset" className="btn btn-outline-secondary px-4" onClick={handleClear}>
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="btn text-white border-0 px-4"
                      style={{ background: 'linear-gradient(135deg, #C73866, #FD8F52)' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Document'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
