<!-- src/components/Help/HelpModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="$emit('close')"></div>
      <!-- 模态框 -->
      <div class="relative glass-card w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-800">使用说明</h2>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 内容 -->
        <div class="overflow-y-auto p-5 space-y-6">
          <!-- 概述 -->
          <section>
            <p class="text-sm text-gray-600 leading-relaxed">
              FlexViz Lite 是一款浏览器端数据可视化工具，无需安装任何软件，数据完全在本地浏览器中处理，不会上传到服务器。
            </p>
          </section>

          <!-- 快速开始 -->
          <section>
            <h3 class="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              快速开始
            </h3>
            <div class="space-y-2">
              <StepItem :step="1" title="初始化数据库">
                打开页面后，系统会自动初始化 DuckDB 数据库引擎。状态栏显示"已就绪"即可开始使用。
              </StepItem>
              <StepItem :step="2" title="导入数据">
                支持三种方式导入数据：
                <ul class="mt-1 ml-4 list-disc text-xs text-gray-500 space-y-0.5">
                  <li><strong>拖拽上传</strong>：将文件直接拖到上传区域</li>
                  <li><strong>点击上传</strong>：点击"选择文件"按钮选择文件</li>
                  <li>支持格式：<strong>CSV</strong>、<strong>Excel</strong> (.xlsx)、<strong>JSON</strong></li>
                </ul>
              </StepItem>
              <StepItem :step="3" title="查询和可视化">
                数据导入后，可以通过可视化查询器或 SQL 编辑器查询数据，然后生成图表。
              </StepItem>
            </div>
          </section>

          <!-- 功能详解 -->
          <section>
            <h3 class="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              功能详解
            </h3>

            <div class="space-y-3">
              <FeatureItem title="数据表管理" description="左侧边栏显示所有已导入的数据表。点击表名可预览数据，点击删除按钮可移除表。" />
              <FeatureItem title="可视化查询" description="无需编写 SQL，通过选择表、列、筛选条件和排序方式来构建查询。点击[查看 SQL]可查看生成的 SQL 语句。" />
              <FeatureItem title="SQL 编辑器" description="适合有 SQL 基础的用户。直接输入 SQL 语句查询数据，按 Ctrl+Enter 执行。使用 DuckDB 语法。" />
              <FeatureItem title="图表可视化" description="查询结果支持 9 种图表类型：柱状图、折线图、面积图、饼图、散点图、雷达图、漏斗图、仪表盘、热力图。" />
              <FeatureItem title="图表交互" description="支持缩放、数值标签显示、动画效果。可通过图表样式面板自定义颜色主题、字体大小、图例位置等。" />
              <FeatureItem title="数据筛选" description="在图表配置面板中可添加筛选条件和排序规则，实时过滤图表数据。" />
              <FeatureItem title="导出功能" description="图表支持导出为 PNG 图片、SVG 矢量图、CSV 数据。仪表盘支持整体导出为 PNG 或 PDF。" />
              <FeatureItem title="仪表盘" description="点击顶部[仪表盘]按钮进入仪表盘页面。可创建多个仪表盘，每个仪表盘可添加多个图表，支持 2/3/4 列布局和自由拖拽布局。" />
              <FeatureItem title="图表模板" description="图表配置面板顶部提供 8 种快速模板（月度趋势、Top10 排名、占比分析等），一键应用预设配置。" />
              <FeatureItem title="图表标题自动生成" description="选择图表类型和数据列后，系统会自动建议图表标题。点击建议标签即可采纳。" />
              <FeatureItem title="图表快照/收藏" description="在图表区域点击[收藏]按钮保存当前图表配置。已收藏的快照可随时恢复，方便对比不同配置。" />
              <FeatureItem title="派生列（计算字段）" description="在图表配置面板中可定义计算字段，如 price * quantity。支持基本数学运算，结果作为新列用于图表。" />
              <FeatureItem title="数据标注" description="在图表样式面板中可为特定数据点添加文字标注，自定义标注位置和颜色。" />
              <FeatureItem title="趋势线" description="折线图、面积图和散点图支持添加趋势线。可选择线性回归或移动平均，帮助识别数据趋势。" />
              <FeatureItem title="多图表对比" description="点击图表区域的[对比视图]按钮，可同时查看 2-3 种不同图表类型，方便选择最佳可视化方式。" />
              <FeatureItem title="自由布局仪表盘" description="在仪表盘中点击[自由布局]按钮，可拖拽图表调整位置，支持 1×1、2×1、1×2、2×2 四种尺寸。" />
            </div>
          </section>

          <!-- 数据持久化 -->
          <section>
            <h3 class="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
              数据存储
            </h3>
            <div class="p-3 bg-primary-50 border border-primary-100 rounded-lg">
              <ul class="text-xs text-gray-600 space-y-1.5">
                <li class="flex items-start gap-2">
                  <span class="text-primary-500 mt-0.5">•</span>
                  <span>所有数据存储在浏览器的 <strong>IndexedDB</strong> 中，刷新页面后数据自动恢复</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-500 mt-0.5">•</span>
                  <span>数据<strong>不会上传</strong>到任何服务器，完全在本地处理</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-500 mt-0.5">•</span>
                  <span>清除浏览器数据会导致导入的数据丢失，建议定期导出备份</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-500 mt-0.5">•</span>
                  <span>仪表盘配置也存储在本地，支持创建多个仪表盘</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- SQL 示例 -->
          <section>
            <h3 class="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              SQL 查询示例
            </h3>
            <div class="space-y-2">
              <CodeExample title="基础查询">SELECT * FROM "表名" LIMIT 100</CodeExample>
              <CodeExample title="条件筛选">SELECT * FROM "表名" WHERE "列名" &gt; 100</CodeExample>
              <CodeExample title="聚合统计">SELECT "类别", SUM("金额") as 总额 FROM "表名" GROUP BY "类别"</CodeExample>
              <CodeExample title="排序">SELECT * FROM "表名" ORDER BY "列名" DESC LIMIT 50</CodeExample>
            </div>
          </section>

          <!-- 快捷键 -->
          <section>
            <h3 class="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
              快捷键
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono">Enter</kbd>
                <span>执行 SQL 查询</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 底部 -->
        <div class="p-4 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-400">FlexViz Lite — 浏览器端数据可视化工具</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import StepItem from './StepItem.vue';
import FeatureItem from './FeatureItem.vue';
import CodeExample from './CodeExample.vue';

defineProps<{ visible: boolean }>();
defineEmits<{ close: [] }>();
</script>
