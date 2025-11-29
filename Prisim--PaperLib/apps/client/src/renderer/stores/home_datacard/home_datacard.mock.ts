/**
 * Home DataCard Mock 数据源
 * Web 调试模式使用
 */
import type { DataCardDataSource, DataCard, DataCardFilter, DataCardCreateInput, Paper } from './home_datacard.datasource'

/** 模拟论文数据 */
const mockPapers: Paper[] = [
  // Transformer 研究 (projectId: 1)
  { id: 'p1', title: 'Attention Is All You Need', authors: ['Vaswani, A.', 'Shazeer, N.'], year: 2017, abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...', tags: ['Transformer', 'NLP'], projectId: '1', pdfPath: null, isRead: true, isAnnotated: true, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-15') },
  { id: 'p2', title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: ['Devlin, J.', 'Chang, M.'], year: 2018, abstract: 'We introduce a new language representation model called BERT...', tags: ['BERT', 'NLP'], projectId: '1', pdfPath: null, isRead: true, isAnnotated: true, createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-16') },
  { id: 'p3', title: 'GPT-3: Language Models are Few-Shot Learners', authors: ['Brown, T.', 'Mann, B.'], year: 2020, abstract: 'Recent work has demonstrated substantial gains on many NLP tasks...', tags: ['GPT', 'NLP'], projectId: '1', pdfPath: null, isRead: true, isAnnotated: false, createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-17') },
  { id: 'p4', title: 'T5: Exploring Transfer Learning with a Unified Text-to-Text Transformer', authors: ['Raffel, C.'], year: 2019, abstract: 'Transfer learning has emerged as a powerful technique in NLP...', tags: ['T5', 'NLP'], projectId: '1', pdfPath: null, isRead: false, isAnnotated: false, createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-18') },
  
  // CV 论文集 (projectId: 2)
  { id: 'p5', title: 'ResNet: Deep Residual Learning for Image Recognition', authors: ['He, K.', 'Zhang, X.'], year: 2015, abstract: 'Deeper neural networks are more difficult to train...', tags: ['ResNet', 'CV'], projectId: '2', pdfPath: null, isRead: true, isAnnotated: true, createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-19') },
  { id: 'p6', title: 'YOLO: Real-Time Object Detection', authors: ['Redmon, J.'], year: 2016, abstract: 'We present YOLO, a new approach to object detection...', tags: ['YOLO', 'CV'], projectId: '2', pdfPath: null, isRead: true, isAnnotated: false, createdAt: new Date('2024-01-06'), updatedAt: new Date('2024-01-20') },
  { id: 'p7', title: 'ViT: An Image is Worth 16x16 Words', authors: ['Dosovitskiy, A.'], year: 2020, abstract: 'While the Transformer architecture has become the de-facto standard...', tags: ['ViT', 'CV'], projectId: '2', pdfPath: null, isRead: false, isAnnotated: false, createdAt: new Date('2024-01-07'), updatedAt: new Date('2024-01-21') },
  
  // NLP 基础 (projectId: 3)
  { id: 'p8', title: 'Word2Vec: Distributed Representations of Words', authors: ['Mikolov, T.'], year: 2013, abstract: 'We propose two novel model architectures for computing continuous vector representations...', tags: ['Word2Vec', 'NLP'], projectId: '3', pdfPath: null, isRead: true, isAnnotated: true, createdAt: new Date('2024-01-08'), updatedAt: new Date('2024-01-22') },
  { id: 'p9', title: 'ELMo: Deep Contextualized Word Representations', authors: ['Peters, M.'], year: 2018, abstract: 'We introduce a new type of deep contextualized word representation...', tags: ['ELMo', 'NLP'], projectId: '3', pdfPath: null, isRead: true, isAnnotated: false, createdAt: new Date('2024-01-09'), updatedAt: new Date('2024-01-23') },
  { id: 'p10', title: 'GloVe: Global Vectors for Word Representation', authors: ['Pennington, J.'], year: 2014, abstract: 'Recent methods for learning vector space representations of words...', tags: ['GloVe', 'NLP'], projectId: '3', pdfPath: null, isRead: true, isAnnotated: true, createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-24') },
  
  // 强化学习 (projectId: 4)
  { id: 'p11', title: 'DQN: Playing Atari with Deep Reinforcement Learning', authors: ['Mnih, V.'], year: 2013, abstract: 'We present the first deep learning model to successfully learn control policies...', tags: ['DQN', 'RL'], projectId: '4', pdfPath: null, isRead: true, isAnnotated: false, createdAt: new Date('2024-01-11'), updatedAt: new Date('2024-01-25') },
  { id: 'p12', title: 'PPO: Proximal Policy Optimization Algorithms', authors: ['Schulman, J.'], year: 2017, abstract: 'We propose a new family of policy gradient methods...', tags: ['PPO', 'RL'], projectId: '4', pdfPath: null, isRead: false, isAnnotated: false, createdAt: new Date('2024-01-12'), updatedAt: new Date('2024-01-26') },
  
  // 图神经网络 (projectId: 5)
  { id: 'p13', title: 'GCN: Semi-Supervised Classification with Graph Convolutional Networks', authors: ['Kipf, T.'], year: 2016, abstract: 'We present a scalable approach for semi-supervised learning on graph-structured data...', tags: ['GCN', 'GNN'], projectId: '5', pdfPath: null, isRead: true, isAnnotated: true, createdAt: new Date('2024-01-13'), updatedAt: new Date('2024-01-27') },
  { id: 'p14', title: 'GAT: Graph Attention Networks', authors: ['Veličković, P.'], year: 2017, abstract: 'We present graph attention networks (GATs)...', tags: ['GAT', 'GNN'], projectId: '5', pdfPath: null, isRead: true, isAnnotated: false, createdAt: new Date('2024-01-14'), updatedAt: new Date('2024-01-28') },
  { id: 'p15', title: 'GraphSAGE: Inductive Representation Learning on Large Graphs', authors: ['Hamilton, W.'], year: 2017, abstract: 'Low-dimensional embeddings of nodes in large graphs have proved extremely useful...', tags: ['GraphSAGE', 'GNN'], projectId: '5', pdfPath: null, isRead: false, isAnnotated: false, createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-29') },
]

/** 模拟数据卡片 */
const mockDataCards: DataCard[] = [
  {
    id: '1',
    name: 'Transformer 研究',
    description: '关于 Transformer 架构及其变体的论文集合，包括 BERT、GPT、T5 等经典模型。',
    paperCount: 12,
    tags: ['NLP', 'Deep Learning'],
    coverColor: '#007AFF',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    stats: {
      totalPapers: 12,
      readPapers: 8,
      annotatedPapers: 5,
      lastOpenedAt: new Date('2024-01-20')
    }
  },
  {
    id: '2',
    name: 'CV 论文集',
    description: '计算机视觉领域的重要论文，涵盖图像分类、目标检测、语义分割等方向。',
    paperCount: 8,
    tags: ['CV', 'Deep Learning'],
    coverColor: '#34C759',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-18'),
    stats: {
      totalPapers: 8,
      readPapers: 6,
      annotatedPapers: 3,
      lastOpenedAt: new Date('2024-01-18')
    }
  },
  {
    id: '3',
    name: 'NLP 基础',
    description: '自然语言处理基础论文，包括词向量、语言模型、序列标注等经典工作。',
    paperCount: 25,
    tags: ['NLP', 'Fundamentals'],
    coverColor: '#FF9500',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-17'),
    stats: {
      totalPapers: 25,
      readPapers: 20,
      annotatedPapers: 12,
      lastOpenedAt: new Date('2024-01-17')
    }
  },
  {
    id: '4',
    name: '强化学习',
    description: '强化学习领域论文，从 DQN 到 PPO，再到多智能体强化学习。',
    paperCount: 6,
    tags: ['RL', 'Deep Learning'],
    coverColor: '#AF52DE',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-16'),
    stats: {
      totalPapers: 6,
      readPapers: 4,
      annotatedPapers: 2,
      lastOpenedAt: new Date('2024-01-16')
    }
  },
  {
    id: '5',
    name: '图神经网络',
    description: 'GNN 相关论文，包括 GCN、GAT、GraphSAGE 等图神经网络架构。',
    paperCount: 15,
    tags: ['GNN', 'Deep Learning'],
    coverColor: '#FF2D55',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-15'),
    stats: {
      totalPapers: 15,
      readPapers: 10,
      annotatedPapers: 6,
      lastOpenedAt: new Date('2024-01-15')
    }
  },
  {
    id: '6',
    name: '多模态学习',
    description: '多模态学习论文，探索视觉-语言、音频-视觉等跨模态理解与生成。',
    paperCount: 9,
    tags: ['Multimodal', 'Deep Learning'],
    coverColor: '#5856D6',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
    stats: {
      totalPapers: 9,
      readPapers: 5,
      annotatedPapers: 3,
      lastOpenedAt: new Date('2024-01-14')
    }
  },
  {
    id: '7',
    name: '知识图谱',
    description: '知识图谱构建与推理，包括实体识别、关系抽取、知识推理等。',
    paperCount: 18,
    tags: ['KG', 'NLP'],
    coverColor: '#00C7BE',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-13'),
    stats: {
      totalPapers: 18,
      readPapers: 12,
      annotatedPapers: 8,
      lastOpenedAt: new Date('2024-01-13')
    }
  },
  {
    id: '8',
    name: '推荐系统',
    description: '推荐系统论文，从协同过滤到深度学习推荐，再到对话式推荐。',
    paperCount: 11,
    tags: ['RecSys', 'Deep Learning'],
    coverColor: '#FF6B6B',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
    stats: {
      totalPapers: 11,
      readPapers: 7,
      annotatedPapers: 4,
      lastOpenedAt: new Date('2024-01-12')
    }
  },
  {
    id: '9',
    name: '自动驾驶',
    description: '自动驾驶感知与决策论文，包括 3D 检测、轨迹预测、端到端驾驶等。',
    paperCount: 7,
    tags: ['Autonomous', 'CV'],
    coverColor: '#64D2FF',
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-11'),
    stats: {
      totalPapers: 7,
      readPapers: 3,
      annotatedPapers: 1,
      lastOpenedAt: new Date('2024-01-11')
    }
  },
  {
    id: '10',
    name: '医学影像',
    description: '医学影像分析论文，涵盖 CT、MRI、X-Ray 等影像的智能诊断。',
    paperCount: 14,
    tags: ['Medical', 'CV'],
    coverColor: '#30D158',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-10'),
    stats: {
      totalPapers: 14,
      readPapers: 9,
      annotatedPapers: 5,
      lastOpenedAt: new Date('2024-01-10')
    }
  },
  {
    id: '11',
    name: '语音识别',
    description: '语音识别与合成论文，从传统 HMM 到端到端神经网络模型。',
    paperCount: 5,
    tags: ['Speech', 'Deep Learning'],
    coverColor: '#BF5AF2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-09'),
    stats: {
      totalPapers: 5,
      readPapers: 3,
      annotatedPapers: 2,
      lastOpenedAt: new Date('2024-01-09')
    }
  },
  {
    id: '12',
    name: '机器翻译',
    description: '机器翻译论文，从统计机器翻译到神经机器翻译的发展历程。',
    paperCount: 20,
    tags: ['NLP', 'Translation'],
    coverColor: '#FFD60A',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-08'),
    stats: {
      totalPapers: 20,
      readPapers: 15,
      annotatedPapers: 10,
      lastOpenedAt: new Date('2024-01-08')
    }
  }
]

export class DataCardMockDataSource implements DataCardDataSource {
  private dataCards = [...mockDataCards]

  async getList(filter?: DataCardFilter): Promise<DataCard[]> {
    await this.delay(200)
    
    let result = [...this.dataCards]
    
    if (filter?.tag) {
      result = result.filter(d => d.tags.includes(filter.tag!))
    }
    
    if (filter?.sortBy) {
      const order = filter.sortOrder === 'asc' ? 1 : -1
      result.sort((a, b) => {
        if (filter.sortBy === 'name') {
          return a.name.localeCompare(b.name) * order
        }
        if (filter.sortBy === 'paperCount') {
          return (a.paperCount - b.paperCount) * order
        }
        if (filter.sortBy === 'updatedAt') {
          return (a.updatedAt.getTime() - b.updatedAt.getTime()) * order
        }
        if (filter.sortBy === 'createdAt') {
          return (a.createdAt.getTime() - b.createdAt.getTime()) * order
        }
        return 0
      })
    }
    
    return result
  }

  async getById(id: string): Promise<DataCard | null> {
    await this.delay(100)
    return this.dataCards.find(d => d.id === id) ?? null
  }

  async create(input: DataCardCreateInput): Promise<DataCard> {
    await this.delay(300)
    const dataCard: DataCard = {
      id: String(Date.now()),
      name: input.name,
      description: input.description ?? '',
      paperCount: 0,
      tags: input.tags ?? [],
      coverColor: input.coverColor ?? '#007AFF',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalPapers: 0,
        readPapers: 0,
        annotatedPapers: 0,
        lastOpenedAt: null
      }
    }
    this.dataCards.push(dataCard)
    return dataCard
  }

  async update(id: string, input: Partial<DataCardCreateInput>): Promise<DataCard> {
    await this.delay(200)
    const index = this.dataCards.findIndex(d => d.id === id)
    if (index === -1) throw new Error('DataCard not found')
    
    this.dataCards[index] = {
      ...this.dataCards[index],
      ...input,
      updatedAt: new Date()
    }
    return this.dataCards[index]
  }

  async delete(id: string): Promise<void> {
    await this.delay(200)
    const index = this.dataCards.findIndex(d => d.id === id)
    if (index !== -1) {
      this.dataCards.splice(index, 1)
    }
  }

  async search(query: string): Promise<DataCard[]> {
    await this.delay(300)
    const q = query.toLowerCase()
    return this.dataCards.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  // 论文相关方法
  async getAllPapers(): Promise<Paper[]> {
    await this.delay(150)
    return [...mockPapers]
  }

  async getPapersByProject(projectId: string): Promise<Paper[]> {
    await this.delay(100)
    return mockPapers.filter(p => p.projectId === projectId)
  }

  async getPaperById(id: string): Promise<Paper | null> {
    await this.delay(50)
    return mockPapers.find(p => p.id === id) ?? null
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
