export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">样式测试页面</h1>
      
      {/* 测试按钮 */}
      <div className="mb-8 space-x-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          蓝色按钮
        </button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          绿色按钮
        </button>
      </div>

      {/* 测试卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border">
          <h3 className="text-lg font-semibold mb-2">测试卡片 1</h3>
          <p className="text-gray-600 dark:text-gray-300">这是一个测试卡片的描述内容。</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border">
          <h3 className="text-lg font-semibold mb-2">测试卡片 2</h3>
          <p className="text-gray-600 dark:text-gray-300">这是另一个测试卡片的描述内容。</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border">
          <h3 className="text-lg font-semibold mb-2">测试卡片 3</h3>
          <p className="text-gray-600 dark:text-gray-300">第三个测试卡片的描述内容。</p>
        </div>
      </div>

      {/* 测试表单 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border mb-8">
        <h3 className="text-lg font-semibold mb-4">测试表单</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">输入框</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">文本域</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="请输入多行内容"
            />
          </div>
        </div>
      </div>

      {/* 测试颜色 */}
      <div className="grid grid-cols-6 gap-4">
        <div className="h-20 bg-red-500 rounded flex items-center justify-center text-white font-bold">红色</div>
        <div className="h-20 bg-blue-500 rounded flex items-center justify-center text-white font-bold">蓝色</div>
        <div className="h-20 bg-green-500 rounded flex items-center justify-center text-white font-bold">绿色</div>
        <div className="h-20 bg-yellow-500 rounded flex items-center justify-center text-white font-bold">黄色</div>
        <div className="h-20 bg-purple-500 rounded flex items-center justify-center text-white font-bold">紫色</div>
        <div className="h-20 bg-gray-500 rounded flex items-center justify-center text-white font-bold">灰色</div>
      </div>
    </div>
  )
} 