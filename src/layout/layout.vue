<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
    FirstAidKit,
    House,
    Document,
    DataLine,
    CircleCheck,
    Bell,
    Search,
    Tools,
    Histogram,
    Setting
} from "@element-plus/icons-vue";

const route = useRoute();
const activeMenu = ref(route.path || "/workbench");

const routePaths = {
    "/workbench": ["工作台", "工作台"],
    "/ecg-data": ["心电数据管理"],
    "/ai-diagnosis": ["AI诊断中心"],
    "/report": ["诊断报告管理"],
    "/patient": ["工作台", "患者管理"],
    "/warning": ["预警监控"],
    "/realtime": ["实时监护"],
    "/device": ["设备管理", "设备管理"],
    "/quality": ["设备管理", "质控管理"],
    "/analysis": ["数据分析"],
    "/system/departments": ["系统管理", "科室管理"],
    "/system/users": ["系统管理", "用户管理"],
    "/system/roles": ["系统管理", "角色与权限管理"]
};

const breadcrumbs = computed(() => {
    return routePaths[route.path] || [];
});

const applyTheme = () => {
    const root = document.documentElement;
    // 更深一点的蓝
    root.style.setProperty('--el-color-primary', '#3582e6');
    root.style.setProperty('--el-color-primary-light-3', '#68a1ed');
    root.style.setProperty('--el-color-primary-light-5', '#9abff4');
    root.style.setProperty('--el-color-primary-light-7', '#caddf9');
    root.style.setProperty('--el-color-primary-light-8', '#e2eefb');
    root.style.setProperty('--el-color-primary-light-9', '#f1f6fd');
    root.style.setProperty('--el-color-primary-dark-2', '#2a68b8');
};

onMounted(() => {
    applyTheme();
});
</script>

<template>
    <div class="layout">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="logo">
                <el-icon class="logo-icon">
                    <FirstAidKit />
                </el-icon>
                <span class="logo-text">心电图情报分析平台<br /><small>ECG Intelligence Analysis Platform</small></span>
            </div>
            <el-menu :default-active="activeMenu" class="sidebar-menu" :collapse="false" router>
                <el-sub-menu index="workbench-group">
                    <template #title>
                        <el-icon>
                            <House />
                        </el-icon>
                        <span>工作台</span>
                    </template>
                    <el-menu-item index="/workbench">工作台</el-menu-item>
                    <el-menu-item index="/patient">患者管理</el-menu-item>
                </el-sub-menu>
                <el-menu-item index="/ecg-data">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <template #title>心电数据管理</template>
                </el-menu-item>
                <el-menu-item index="/ai-diagnosis">
                    <el-icon>
                        <DataLine />
                    </el-icon>
                    <template #title>AI诊断中心</template>
                </el-menu-item>
                <el-menu-item index="/report">
                    <el-icon>
                        <CircleCheck />
                    </el-icon>
                    <template #title>诊断报告管理</template>
                </el-menu-item>
                <el-menu-item index="/warning">
                    <el-icon>
                        <Bell />
                    </el-icon>
                    <template #title>预警监控</template>
                </el-menu-item>
                <el-menu-item index="/realtime">
                    <el-icon>
                        <Search />
                    </el-icon>
                    <template #title>实时监护</template>
                </el-menu-item>
                <el-sub-menu index="device-group">
                    <template #title>
                        <el-icon>
                            <Tools />
                        </el-icon>
                        <span>设备管理</span>
                    </template>
                    <el-menu-item index="/device">设备管理</el-menu-item>
                    <el-menu-item index="/quality">质控管理</el-menu-item>
                </el-sub-menu>
                <el-menu-item index="/analysis">
                    <el-icon>
                        <Histogram />
                    </el-icon>
                    <template #title>数据分析</template>
                </el-menu-item>
                <el-sub-menu index="/system">
                    <template #title>
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <span>系统管理</span>
                    </template>
                    <el-menu-item index="/system/departments">科室管理</el-menu-item>
                    <el-menu-item index="/system/users">用户管理</el-menu-item>
                    <el-menu-item index="/system/roles">角色与权限管理</el-menu-item>
                </el-sub-menu>
            </el-menu>
        </div>

        <!-- Main Content -->
        <div class="main-container">
            <!-- Header -->
            <div class="header">
                <div class="breadcrumb-wrap">
                    <el-breadcrumb separator=">">
                        <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                            {{ item }}
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="header-actions">
                    <el-dropdown placement="bottom-end">
                        <el-icon class="action-icon">
                            <Setting />
                        </el-icon>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <div class="user-profile">
                        <div class="user-info">
                            <span class="user-name">马报国</span>
                            <span class="user-role">神经内科 - 主任医师</span>
                        </div>
                        <el-avatar class="user-avatar" :size="36"
                            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                    </div>
                </div>
            </div>

            <!-- Content Area (Router View) -->
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

/* Sidebar */
.sidebar {
    width: 240px;
    background-color: var(--el-color-primary);
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    z-index: 10;
    border-radius: 0 20px 20px 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);

    .logo {
        display: flex;
        align-items: center;
        padding: 0 30px;
        margin-bottom: 40px;
        color: #ffffff;

        .logo-icon {
            font-size: 24px;
            color: #ffffff;
            margin-right: 12px;
        }

        .logo-text {
            font-size: 16px;
            font-weight: 600;
            line-height: 1.2;

            small {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.7);
                font-weight: normal;
            }
        }
    }

    .sidebar-menu {
        flex: 1;
        overflow-y: auto;
        border-right: none;
        padding: 0 16px;
        background-color: transparent;

        /* 隐藏滚动条显得更美观 */
        &::-webkit-scrollbar {
            display: none;
        }

        scrollbar-width: none;

        // 为了覆盖 el-menu 以及多级子菜单原本的样式
        :deep(.el-menu) {
            background-color: transparent !important;
            border-right: none;
        }

        :deep(.el-sub-menu .el-menu) {
            background-color: transparent !important;
        }

        .el-menu-item,
        :deep(.el-sub-menu__title) {
            color: rgba(255, 255, 255, 0.85) !important;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1) !important;
                color: #ffffff !important;
            }
        }

        .el-menu-item {
            height: 48px;
            line-height: 48px;
            border-radius: 24px;
            margin-bottom: 8px;
            font-size: 14px;
            background-color: transparent;

            .el-icon {
                margin-right: 16px;
                font-size: 18px;
                color: inherit;
            }

            &.is-active {
                background-color: rgba(255, 255, 255, 0.2) !important;
                color: #ffffff !important;
                font-weight: 500;
            }
        }

        :deep(.el-sub-menu__title) {
            height: 48px;
            line-height: 48px;
            border-radius: 24px;
            margin-bottom: 8px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.85);

            .el-icon {
                margin-right: 16px;
                font-size: 18px;
                color: inherit;
            }
        }

        :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            font-weight: 500;
        }
    }
}

/* Main Container */
.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px 32px;
    overflow-y: auto;
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--el-bg-color-overlay);
    padding: 16px 24px;
    border-radius: 16px;
    margin-bottom: 24px;

    .breadcrumb-wrap {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--el-text-color-regular);
    }

    .header-actions {
        display: flex;
        align-items: center;

        .action-icon {
            font-size: 18px;
            color: var(--el-color-primary);
            margin-right: 16px;
            cursor: pointer;
            background-color: var(--el-color-primary-light-9);
            border-radius: 50%;
            width: 34px;
            height: 34px;
            display: flex;
            justify-content: center;
            align-items: center;
            outline: none;
            /* 去除下拉菜单触发获取焦点时的边框 */
        }

        .user-profile {
            display: flex;
            align-items: center;
            margin-left: 10px;

            .user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                margin-right: 12px;

                .user-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--el-text-color-primary);
                }

                .user-role {
                    font-size: 12px;
                    color: var(--el-color-primary);
                }
            }
        }
    }
}
</style>
