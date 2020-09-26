interface SelectType {
    PROJECT: 'project';
    RELEASE: 'release';
}


export const GITLAB_SITE = process.env.GITLAB_RESOURCE || "";
export const JIRA_SITE = process.env.JIRA_RESOURCE || "";

export const TOKEN = process.env.PRIVATE_TOKEN || "";
export const STORAGE_KEY = '_ext_storage_'


export const PARENT_SELECTOR = "top-level-version-info";
export const SELECT_TYPE: SelectType = {
    PROJECT: 'project',
    RELEASE: 'release'
}

export const SELECT_DEFAULT: string = '-placeholder-';
