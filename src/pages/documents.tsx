import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast'
import {
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Folder,
  Image,
  File,
  FileSpreadsheet,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const categories = [
  { id: 'all', label: 'All', count: 12 },
  { id: 'identity', label: 'Identity', count: 4 },
  { id: 'education', label: 'Education', count: 3 },
  { id: 'employment', label: 'Employment', count: 3 },
  { id: 'other', label: 'Other', count: 2 },
]

const documents = [
  { id: '1', name: 'Employee Handbook.pdf', category: 'employment', size: '2.4 MB', uploadedAt: '2026-07-10', type: 'pdf' },
  { id: '2', name: 'NDA Agreement.pdf', category: 'employment', size: '1.1 MB', uploadedAt: '2026-07-08', type: 'pdf' },
  { id: '3', name: 'Company Policy.pdf', category: 'other', size: '3.2 MB', uploadedAt: '2026-07-05', type: 'pdf' },
  { id: '4', name: 'ID Proof.jpg', category: 'identity', size: '1.8 MB', uploadedAt: '2026-07-01', type: 'image' },
  { id: '5', name: 'Resume.pdf', category: 'employment', size: '2.0 MB', uploadedAt: '2026-06-28', type: 'pdf' },
  { id: '6', name: 'Degree Certificate.pdf', category: 'education', size: '4.5 MB', uploadedAt: '2026-06-25', type: 'pdf' },
  { id: '7', name: 'Address Proof.pdf', category: 'identity', size: '1.5 MB', uploadedAt: '2026-06-20', type: 'pdf' },
  { id: '8', name: 'Marksheet.pdf', category: 'education', size: '3.8 MB', uploadedAt: '2026-06-15', type: 'pdf' },
  { id: '9', name: 'Passport.pdf', category: 'identity', size: '2.2 MB', uploadedAt: '2026-06-10', type: 'pdf' },
  { id: '10', name: 'Tax Document.pdf', category: 'other', size: '1.9 MB', uploadedAt: '2026-06-05', type: 'pdf' },
  { id: '11', name: 'Education Certificate.pdf', category: 'education', size: '2.7 MB', uploadedAt: '2026-06-01', type: 'pdf' },
  { id: '12', name: 'Photo.jpg', category: 'identity', size: '3.1 MB', uploadedAt: '2026-05-28', type: 'image' },
]

const fileIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  image: Image,
  spreadsheet: FileSpreadsheet,
  default: File,
}

export function Documents() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('grid')

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      toast(`Document "${files[0].name}" uploaded successfully!`, 'success')
      e.target.value = ''
    }
  }

  const handleDownload = (doc: any) => {
    toast(`Downloading "${doc.name}"...`, 'info')
  }

  const handleView = (doc: any) => {
    toast(`Viewing "${doc.name}"...`, 'info')
  }

  const handleDelete = (doc: any) => {
    toast(`Document "${doc.name}" deleted!`, 'error')
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Documents</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">Manage employee documents and files.</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
        />
        <Button className="w-full sm:w-auto" onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:bg-border/50'
              }`}
            >
              {cat.label}
              <span className={`text-xs ${activeCategory === cat.id ? 'text-white/70' : 'text-text-secondary'}`}>
                ({cat.count})
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === 'grid'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Folder className="h-4 w-4" />
            Grid
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText className="h-4 w-4" />
            List
          </button>
        </div>
      </motion.div>

      {/* Documents */}
      <motion.div variants={item}>
        {filteredDocs.length > 0 ? (
          activeTab === 'grid' ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredDocs.map((doc) => {
                const Icon = fileIcons[doc.type] || fileIcons.default
                return (
                  <Card key={doc.id} className="card-hover group">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <h4 className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-text-primary line-clamp-2">
                          {doc.name}
                        </h4>
                        <p className="mt-1 text-[10px] sm:text-xs text-text-secondary">{doc.size}</p>
                        <div className="mt-2 sm:mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleView(doc)}>
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleDownload(doc)}>
                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-danger" onClick={() => handleDelete(doc)}>
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background/50">
                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Name
                        </th>
                        <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Category
                        </th>
                        <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Size
                        </th>
                        <th className="px-4 sm:px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredDocs.map((doc) => {
                        const Icon = fileIcons[doc.type] || fileIcons.default
                        return (
                          <tr key={doc.id} className="hover:bg-background/50 transition-colors">
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary-50 text-primary shrink-0">
                                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-text-primary text-xs truncate">{doc.name}</p>
                                  <p className="text-xs text-text-secondary sm:hidden">{doc.category} • {doc.size}</p>
                                </div>
                              </div>
                            </td>
                            <td className="hidden sm:table-cell whitespace-nowrap px-6 py-4">
                              <Badge variant="secondary" className="capitalize">{doc.category}</Badge>
                            </td>
                            <td className="hidden md:table-cell whitespace-nowrap px-6 py-4">
                              <span className="text-xs text-text-secondary">{doc.size}</span>
                            </td>
                            <td className="whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(doc)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc)}>
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-danger h-8 w-8" onClick={() => handleDelete(doc)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No documents found"
            description="Upload your first document to get started."
            action={
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            }
          />
        )}
      </motion.div>
    </motion.div>
  )
}
